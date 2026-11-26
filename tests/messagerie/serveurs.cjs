// Tests uniquement : deux boîtes IMAP en mémoire et un serveur SMTP qui n'envoie rien (il note
// ce qu'il reçoit dans le fichier SMTP_LOG). Rien ne sort de la machine.
const fs = require("node:fs");
const hoodiecrow = require("hoodiecrow-imap");
const { SMTPServer } = require("smtp-server");

const plugins = ["ID", "SASL-IR", "AUTH-PLAIN", "NAMESPACE", "IDLE", "ENABLE", "LITERALPLUS", "UNSELECT", "SPECIAL-USE", "CREATE-SPECIAL-USE", "MOVE", "UIDPLUS"];
const boite = (port, user, pass) =>
  hoodiecrow({
    plugins,
    aclOwner: user,
    users: { [user]: { password: pass } },
    storage: { INBOX: { messages: [] }, "": { separator: "/", folders: { Brouillons: { "special-use": "\\Drafts" }, "Envoy&AOk-s": { "special-use": "\\Sent" } } } },
  }).listen(port, () => console.log("imap", port, user));

boite(1143, "a@integration.invalid", "secret-a");
boite(1144, "b@integration.invalid", "secret-b");

new SMTPServer({
  authOptional: false,
  hideSTARTTLS: true,
  disabledCommands: ["STARTTLS"],
  allowInsecureAuth: true,
  onAuth(auth, _session, cb) {
    if (["secret-a", "secret-b"].includes(auth.password)) cb(null, { user: auth.username });
    else cb(new Error("Invalid username or password"));
  },
  onData(stream, session, cb) {
    let d = "";
    stream.on("data", (c) => (d += c));
    stream.on("end", () => {
      fs.appendFileSync(process.env.SMTP_LOG, JSON.stringify({ from: session.envelope.mailFrom.address, to: session.envelope.rcptTo.map((r) => r.address), raw: d }) + "\n");
      cb();
    });
  },
}).listen(1025, () => console.log("smtp 1025"));
