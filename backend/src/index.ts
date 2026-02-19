import express, { type Request, type Response } from "express"

const app = express();

app.get("/", (req: Request, res: Response) => {
    return res.json({
        message: "hi"
    })
})

app.listen(3000, () => console.log("Express app listening on 3000"))