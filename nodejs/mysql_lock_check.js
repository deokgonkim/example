const SQL_INNODB_LOCKS = 'select * from information_schema.INNODB_LOCKS'
const SQL_INNODB_LOCK_WAITS = 'select * from information_schema.INNODB_LOCK_WAITS'
const SQL_INNODB_TRX = 'select * from information_schema.INNODB_TRX where trx_id = ?'

const SQL_ESH = `select 
-- esh.event_name,  
-- esh.sql_text  
esh.THREAD_ID,
esh.EVENT_ID,
esh.END_EVENT_ID,
esh.EVENT_NAME,
esh.SOURCE,
convert(esh.TIMER_START, CHAR) as TIMER_START,
convert(esh.TIMER_END, CHAR) as TIMER_END,
esh.TIMER_WAIT,
esh.LOCK_TIME,
esh.SQL_TEXT,
esh.DIGEST,
esh.DIGEST_TEXT,
esh.CURRENT_SCHEMA,
esh.OBJECT_TYPE,
esh.OBJECT_SCHEMA,
esh.OBJECT_NAME,
esh.OBJECT_INSTANCE_BEGIN,
esh.MYSQL_ERRNO,
esh.RETURNED_SQLSTATE,
esh.MESSAGE_TEXT,
esh.ERRORS,
esh.WARNINGS,
esh.ROWS_AFFECTED,
esh.ROWS_SENT,
esh.ROWS_EXAMINED,
esh.CREATED_TMP_DISK_TABLES,
esh.CREATED_TMP_TABLES,
esh.SELECT_FULL_JOIN,
esh.SELECT_FULL_RANGE_JOIN,
esh.SELECT_RANGE,
esh.SELECT_RANGE_CHECK,
esh.SELECT_SCAN,
esh.SORT_MERGE_PASSES,
esh.SORT_RANGE,
esh.SORT_ROWS,
esh.SORT_SCAN,
esh.NO_INDEX_USED,
esh.NO_GOOD_INDEX_USED,
esh.NESTING_EVENT_ID,
esh.NESTING_EVENT_TYPE,
esh.NESTING_EVENT_LEVEL
from information_schema.INNODB_TRX trx  
  inner join information_schema.INNODB_LOCK_WAITS lw  
      on trx.trx_id = lw.blocking_trx_id  
  inner join performance_schema.threads th  
      on th.processlist_id = trx.trx_mysql_thread_id  
  inner join performance_schema.events_statements_history esh  
      on esh.thread_id = th.thread_id  
where trx.trx_id = ?
order by esh.event_id
`

const SQL_SESSIONS = `
SELECT 
    t.PROCESSLIST_ID,
    IF(NAME = 'thread/sql/event_scheduler',
        'event_scheduler',
        t.PROCESSLIST_USER) PROCESSLIST_USER,
    t.PROCESSLIST_HOST,
    t.PROCESSLIST_DB,
    t.PROCESSLIST_COMMAND,
    t.PROCESSLIST_TIME,
    t.PROCESSLIST_STATE,
    t.THREAD_ID,
    t.TYPE,
    t.NAME,
    t.PARENT_THREAD_ID,
    t.INSTRUMENTED,
    t.PROCESSLIST_INFO,
    a.ATTR_VALUE
FROM
    performance_schema.threads t
        LEFT OUTER JOIN
    performance_schema.session_connect_attrs a ON t.processlist_id = a.processlist_id
        AND (a.attr_name IS NULL
        OR a.attr_name = 'program_name')
WHERE
    t.TYPE <> 'BACKGROUND'
AND t.PROCESSLIST_ID = ?
`

const sleep = async (ms) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, ms)
    })
}


const getLocks = async () => {
    // const locks = await rds.selectMany(SQL_INNODB_LOCKS, [])
    // console.log('locks', JSON.stringify(locks, null, 4))
    console.log(`${new Date()} Checking LOCKS for ${process.env.RDS_HOSTNAME}`)

    const lock_waits = await rds.selectMany(SQL_INNODB_LOCK_WAITS, [])
    // console.log('lock_waits', JSON.stringify(lock_waits, null, 4))

    const locks = []

    for (const wait of lock_waits) {
        lock = {}

        lock.timestamp = new Date()

        lock.database = {
            RDS_HOSTNAME: process.env.RDS_HOSTNAME
        }

        const requesting_trx_id = wait.requesting_trx_id
        const blocking_trx_id = wait.blocking_trx_id

        const requesting_trx = await rds.selectOne(SQL_INNODB_TRX, [requesting_trx_id]).then(({trx_id, trx_state, trx_started, trx_mysql_thread_id, trx_query, trx_operation_state, trx_isolation_level}) => {
            return { trx_id, trx_state, trx_started, trx_mysql_thread_id, trx_query, trx_operation_state, trx_isolation_level }
        })

        const blocking_trx = await rds.selectOne(SQL_INNODB_TRX, [blocking_trx_id]).then(({trx_id, trx_state, trx_started, trx_mysql_thread_id, trx_query, trx_operation_state, trx_isolation_level}) => {
            return { trx_id, trx_state, trx_started, trx_mysql_thread_id, trx_query, trx_operation_state, trx_isolation_level }
        })

        const requesting_sessions = await rds.selectMany(SQL_SESSIONS, [requesting_trx.trx_mysql_thread_id])
        const blocking_sessions = await rds.selectMany(SQL_SESSIONS, [blocking_trx.trx_mysql_thread_id])

        lock.requesting_trx = requesting_trx
        lock.requesting_trx.sessions = requesting_sessions
        lock.requesting_trx.session = requesting_sessions[0]
        lock.requesting_trx.user = requesting_sessions[0].PROCESSLIST_USER
        lock.requesting_trx.host = requesting_sessions[0].PROCESSLIST_HOST
        lock.blocking_trx = blocking_trx
        lock.blocking_trx.sessions = blocking_sessions
        lock.blocking_trx.session = blocking_sessions[0]
        lock.blocking_trx.user = blocking_sessions[0].PROCESSLIST_USER
        lock.blocking_trx.host = blocking_sessions[0].PROCESSLIST_HOST

        lock.requesting_trx.eshs = await rds.selectMany(SQL_ESH, [lock.requesting_trx.trx_id])
        lock.blocking_trx.eshs = await rds.selectMany(SQL_ESH, [lock.blocking_trx.trx_id])

        locks.push(lock)
        
    }
    // fs.writeFileSync('./lock.json', JSON.stringify(lock, null, 4))

    return locks
}

const check = async (interval) => {

    while (true) {
        const locks = await getLocks()
        if (locks.length > 0) {
            let message = 'DB Lock found\n'
            message += `DB Host : ${process.env.RDS_HOSTNAME}\n`
            message += `Lock Count : ${locks.length}\n`
            message += 'See details on kibana\n'
            await apm_notify.report_apm(`[lock-watcher] DB Lock ${process.env.RDS_HOSTNAME.substring(0, 20)}`, message)
        }
        for (const lock of locks) {
            await es.putDocument('db_lock', lock)
        }

        await sleep(interval)
    }
}

module.exports = {
    check
}
