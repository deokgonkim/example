import "./Hello.css"

export const HelloPage = () => {
    return (
        <div className={"p-8"} style={{
            backgroundColor: "tomato"
        }}>
            <h1 className={"text-3xl fond-bold underline"}>
                Hello World!
            </h1>
        </div>
    )
}

export default HelloPage;
