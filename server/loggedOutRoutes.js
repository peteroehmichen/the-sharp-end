const express = require("express");
const router = express.Router();
const path = require("path");
const db = require("./db");
const auth = require("./auth");
const aws = require("./aws");
const { CODE_VALIDITY_IN_MINUTES } = require("./config.json");
const axios = require("axios");
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
// const { default: popup } = require("./popup");

router.get("/welcome", (req, res) => {
    if (req.session.userId) {
        res.redirect("/");
    } else {
        res.sendFile(path.join(__dirname, "..", "client", "index.html"));
    }
});

router.post("/welcome/register.json", async (req, res) => {
    const { username, email, password } = req.body;
    if (username == "" || !email.includes("@") || password == "") {
        return res.json({
            error: "Prohibited input",
        });
    }
    try {
        const hashedPw = await auth.hash(password);
        const result = await db.addUser(username, email, hashedPw);
        req.session.userId = result.rows[0].id;
        res.json({ status: "OK" });
    } catch (err) {
        if (err.code == "23505") {
            res.json({ error: "E-Mail already exists" });
        } else {
            res.json({ error: "Server error" });
        }
    }
});

router.post("/welcome/login.json", async (req, res) => {
    // console.log("received:", req.body);
    try {
        const result = await db.getAuthenticatedUser(
            req.body.email,
            req.body.password
        );
        if (result.id) {
            req.session.userId = result.id;
            res.json({
                status: "OK",
            });
        } else {
            console.log("Login-Error:", result);
            if (result.error == "Error in DB") {
                res.json({ error: "No Connection" });
            } else {
                res.json({ error: "Invalid user credentials" });
            }
        }
    } catch (err) {
        res.json({ error: "Log in rejected" });
    }
});

router.get("/welcome/oauth", (req, res) => {
    if (req.query.provider === "GitHub") {
        const postBody = {
            client_id: process.env.GIT_CLIENT_ID,
            client_secret: process.env.GIT_SECRET,
            code: req.query.code,
        };
        const postOptions = {
            headers: {
                accept: "application/json",
            },
        };
        try {
            axios
                .post(
                    "https://github.com/login/oauth/access_token",
                    postBody,
                    postOptions
                )
                .then((result) => {
                    return result.data.access_token;
                })
                .then((token) => {
                    return axios.get("https://api.github.com/user", {
                        headers: { Authorization: `token ${token}` },
                    });
                })
                .then((userData) => {
                    const { name, email, bio, avatar_url } = userData.data;
                    return db.getOauthUser(
                        req.query.provider,
                        email,
                        name,
                        bio,
                        avatar_url
                    );
                })
                .then((id) => {
                    // console.log("the users ID is:", id);
                    if (id) {
                        req.session.userId = id;
                        res.json({
                            status: "OK",
                        });
                    } else {
                        console.log("unkown OAUTH Login-Error");
                        res.json({ error: "unkown OAUTH Login-Error" });
                    }
                })
                .catch((err) => {
                    return res.status(500).json({ err: err.message });
                });
        } catch (error) {
            console.log("Error:", error);
            return res.status(500).json({ err: error.message });
        }
    } else {
        return res.sendStatus(404);
    }
});

router.get("/welcome/callback", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "client", "callback.html"));
});

router.post("/welcome/reset.json", async (req, res) => {
    try {
        const user = await db.getUserByEmail(req.body.email);
        if (user.rowCount > 0) {
            const code = await aws.sendEMail(req.body.email);
            const result = await db.addResetCode(req.body.email, code);
            if (result.rowCount > 0) {
                const start = new Date(result.rows[0].created_at);
                const end = new Date(
                    start.getTime() + CODE_VALIDITY_IN_MINUTES * 60000
                ).valueOf();
                res.json({ codeValidUntil: end });
            } else {
                res.json({
                    error: "Couldn't read DB",
                });
            }
        } else {
            res.json({ error: "User not found" });
        }
    } catch (err) {
        res.json({ error: "Unknown error in DB" });
    }
});

router.post("/welcome/code.json", async (req, res) => {
    try {
        const isCodeValid = await db.confirmCode(
            req.body.code,
            CODE_VALIDITY_IN_MINUTES.toString(),
            req.body.email
        );
        if (isCodeValid) {
            const hashedPw = await auth.hash(req.body.password);
            const result = await db.updateUserPw(req.body.email, hashedPw);
            if (result.rowCount > 0) {
                res.json({ update: "ok" });
            } else {
                res.json({ error: "Error in password-reset" });
            }
        } else {
            res.json({ error: "Invalid code" });
        }
    } catch (err) {
        res.json({ error: "Unknown error" });
    }
});

module.exports = router;
