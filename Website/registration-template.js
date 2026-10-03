function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
}

function tplRow(label, value) {
    return (
        "<tr>" +
        '<th align="left" style="width:38%;padding:12px;background:#f3f3f3;border:1px solid #dcdcdc;color:#6b7a99;font-size:15px;">' +
        label +
        "</th>" +
        '<td style="padding:12px;border:1px solid #dcdcdc;color:#6b7a99;font-size:15px;">' +
        (escapeHtml(value) || "&nbsp;") +
        "</td></tr>"
    );
}

function tplSection(title, rows) {
    return (
        '<h3 style="margin:28px 0 10px;color:#6b7a99;font-size:20px;">' + title + "</h3>" +
        '<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">' +
        rows.join("") +
        "</table>"
    );
}

function buildRegistrationHtml(d) {
    return (
        '<div style="max-width:640px;margin:0 auto;padding:20px;font-family:Arial,Helvetica,sans-serif;">' +
        '<h2 style="text-align:center;margin:0 0 6px;color:#3d4a5c;font-size:22px;">Family Registration Notification</h2>' +
        '<p style="text-align:center;margin:0;color:#6b7a99;font-size:18px;font-weight:bold;">(Seven Stones Daycare &amp; OSC)</p>' +

        tplSection("Family Information", [tplRow("Family Name", d.familyName)]) +

        tplSection("First Parent Information", [
            tplRow("Name", d.p1Name),
            tplRow("Relationship", d.p1Relationship),
            tplRow("Cellphone", d.p1Phone),
            tplRow("Email", d.p1Email)
        ]) +

        tplSection("Second Parent Information", [
            tplRow("Name", d.p2Name),
            tplRow("Relationship", d.p2Relationship),
            tplRow("Cellphone", d.p2Phone),
            tplRow("Email", d.p2Email)
        ]) +

        tplSection("Children Information", [
            tplRow("Name", d.childName),
            tplRow("Birthdate", d.birthdate),
            tplRow("Age", d.age),
            tplRow("Preferred Start Date", d.startDate),
            tplRow("Comment", d.comment)
        ]) +

        tplSection("Consent", [
            tplRow("Consent given", d.consent),
            tplRow("Submitted on", d.submittedAt)
        ]) +

        '<div style="margin-top:30px;padding:20px;background:#edf1f6;color:#9aa5b8;font-size:13px;text-align:center;">' +
        "This notification was sent from the Seven Stones Daycare &amp; OSC website registration form." +
        "</div></div>"
    );
}