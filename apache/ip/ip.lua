function handle(r)
    r.content_type = "text/plain; charset=utf-8"

    -- 기본 접속 정보 출력
    r:puts("## Basic info\n")
    r:puts("\n")
    r:puts("```\n")
    r:puts(string.format("%-25s: %s\n", "Remote IP", r.useragent_ip))
    r:puts(string.format("%-25s: %s\n", "Protocol", r.protocol))
    r:puts(string.format("%-25s: %s\n", "Method", r.method))
    r:puts(string.format("%-25s: %s\n", "Port", r.port))
    r:puts(string.format("%-25s: %s\n", "Uri", r.uri))
    r:puts("```\n")

    r:puts("---\n")

    r:puts("## HTTP Headers\n")
    r:puts("\n")
    
    -- 모든 HTTP 요청 헤더 출력
    r:puts("```\n")
    for k, v in pairs(r:headers_in_table()) do 
        r:puts(string.format("%-25s: %s\n", k, v))
    end
    r:puts("```\n")

    return apache2.OK
end
