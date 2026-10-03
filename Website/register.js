const CONFIG = {
    SEND_EMAIL: true,

    EMAILJS_PUBLIC_KEY: "ZP0IQdRWBxw5ejMs5",
    EMAILJS_SERVICE_ID: "service_l8y4bac",
    EMAILJS_TEMPLATE_ID: "template_fm4zzdk",          // table sent to the daycare
    EMAILJS_TEMPLATE_ID_PARENT: "template_x4soqd3"    // thank-you sent to the parent
};

const form = document.getElementById("registrationForm");
const formAlert = document.getElementById("formAlert");
const submitButton = document.getElementById("submitButton");

function val(id) {
    return document.getElementById(id).value.trim();
}

function setError(id, message) {
    const input = document.getElementById(id);
    const field = input.closest(".field");
    const error = field.querySelector(".error");

    if (message) {
        field.classList.add("invalid");
        error.textContent = message;
    } else {
        field.classList.remove("invalid");
        error.textContent = "";
    }
    return !message;
}

function phoneDigits(value) {
    let digits = value.replace(/\D/g, "");
    if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
    return digits;
}

function formatPhone(digits) {
    return digits.slice(0, 3) + " " + digits.slice(3, 6) + " " + digits.slice(6);
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function parseDate(value) {
    const parts = value.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
}

function formatDate(value) {
    return parseDate(value).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric"
    });
}

function today() {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
}

function calculateAge(birthValue) {
    const birth = parseDate(birthValue);
    const now = today();
    let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (now.getDate() < birth.getDate()) months--;
    if (months < 0) return "";
    if (months < 24) return months + " months";
    const years = Math.floor(months / 12);
    const rest = months % 12;
    return years + " years" + (rest ? " " + rest + " months" : "");
}

const birthInput = document.getElementById("birthdate");
const startInput = document.getElementById("startDate");
const ageInput = document.getElementById("age");

function toInputValue(date) {
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return date.getFullYear() + "-" + m + "-" + d;
}

birthInput.max = toInputValue(today());
startInput.min = toInputValue(today());

birthInput.addEventListener("change", function () {
    ageInput.value = birthInput.value ? calculateAge(birthInput.value) : "";
});

["p1Phone", "p2Phone"].forEach(function (id) {
    const input = document.getElementById(id);
    input.addEventListener("blur", function () {
        const digits = phoneDigits(input.value);
        if (digits.length === 10) input.value = formatPhone(digits);
    });
});

form.querySelectorAll("input, select, textarea").forEach(function (el) {
    el.addEventListener("input", function () {
        const field = el.closest(".field");
        if (field && field.classList.contains("invalid")) setError(el.id, "");
    });
});

function validate() {
    let ok = true;
    let firstBad = null;

    function check(id, message) {
        const good = setError(id, message);
        if (!good && !firstBad) firstBad = id;
        ok = ok && good;
    }

    check("familyName", val("familyName").length < 2 ? "Enter your family name." : "");

    check("p1Name", val("p1Name").length < 2 ? "Enter the parent's full name." : "");
    check("p1Relationship", val("p1Relationship") ? "" : "Select a relationship.");
    check("p1Phone", phoneDigits(val("p1Phone")).length === 10 ? "" : "Enter a 10-digit phone number, e.g. 780 555 1234.");
    check("p1Email", isValidEmail(val("p1Email")) ? "" : "Enter a valid email address.");

    const p2Used = ["p2Name", "p2Relationship", "p2Phone", "p2Email"].some(function (id) { return val(id); });
    check("p2Name", p2Used && val("p2Name").length < 2 ? "Enter the second parent's name." : "");
    check("p2Relationship", p2Used && !val("p2Relationship") ? "Select a relationship." : "");
    check("p2Phone", p2Used && phoneDigits(val("p2Phone")).length !== 10 ? "Enter a 10-digit phone number." : "");
    check("p2Email", val("p2Email") && !isValidEmail(val("p2Email")) ? "Enter a valid email address." : "");

    check("childName", val("childName").length < 2 ? "Enter the child's full name." : "");

    let birthMsg = "";
    if (!val("birthdate")) {
        birthMsg = "Enter the child's birthdate.";
    } else {
        const birth = parseDate(val("birthdate"));
        const oldest = today();
        oldest.setFullYear(oldest.getFullYear() - 13);
        if (birth > today()) birthMsg = "Birthdate can't be in the future.";
        else if (birth < oldest) birthMsg = "Please check the birthdate.";
    }
    check("birthdate", birthMsg);

    let startMsg = "";
    if (!val("startDate")) startMsg = "Choose a preferred start date.";
    else if (parseDate(val("startDate")) < today()) startMsg = "Start date can't be in the past.";
    check("startDate", startMsg);

    check("consent", document.getElementById("consent").checked ? "" : "Consent is required to submit.");
    check("accuracy", document.getElementById("accuracy").checked ? "" : "Please confirm the information is accurate.");

    if (firstBad) {
        const el = document.getElementById(firstBad);
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus({ preventScroll: true });
    }
    return ok;
}

function collectData() {
    const p2Phone = phoneDigits(val("p2Phone"));

    return {
        familyName: val("familyName"),

        p1Name: val("p1Name"),
        p1Relationship: val("p1Relationship"),
        p1Phone: formatPhone(phoneDigits(val("p1Phone"))),
        p1Email: val("p1Email"),

        p2Name: val("p2Name"),
        p2Relationship: val("p2Relationship"),
        p2Phone: p2Phone.length === 10 ? formatPhone(p2Phone) : "",
        p2Email: val("p2Email"),

        childName: val("childName"),
        birthdate: formatDate(val("birthdate")),
        age: calculateAge(val("birthdate")),
        startDate: formatDate(val("startDate")),
        comment: val("comment"),

        consent: "Yes",
        submittedAt: new Date().toLocaleString("en-CA", {
            dateStyle: "medium", timeStyle: "short"
        })
    };
}

function showAlert(message) {
    formAlert.textContent = message;
    formAlert.hidden = false;
    formAlert.scrollIntoView({ behavior: "smooth", block: "center" });
}

form.addEventListener("submit", async function (event) {
    event.preventDefault();
    formAlert.hidden = true;

    if (document.getElementById("website").value) return;

    if (!validate()) return;

    const data = collectData();
    const html = buildRegistrationHtml(data);
    let emailSent = false;

    if (CONFIG.SEND_EMAIL) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending…";

        try {
            // 1. Registration record to the daycare (the table)
            await emailjs.send(
                CONFIG.EMAILJS_SERVICE_ID,
                CONFIG.EMAILJS_TEMPLATE_ID,
                {
                    subject: "New Registration: " + data.familyName + " (" + data.childName + ")",
                    reply_to: data.p1Email,
                    message_html: html
                },
                { publicKey: CONFIG.EMAILJS_PUBLIC_KEY }
            );
            emailSent = true;

            // 2. Thank-you email to the parent
            // If this fails, the registration still counts as sent
            try {
                await emailjs.send(
                    CONFIG.EMAILJS_SERVICE_ID,
                    CONFIG.EMAILJS_TEMPLATE_ID_PARENT,
                    {
                        to_email: data.p1Email,
                        parent_name: data.p1Name,
                        child_name: data.childName
                    },
                    { publicKey: CONFIG.EMAILJS_PUBLIC_KEY }
                );
            } catch (parentError) {
                console.error("Thank-you email failed:", parentError);
            }
        } catch (error) {
            console.error(error);
            submitButton.disabled = false;
            submitButton.textContent = "Submit Registration";
            showAlert("Something went wrong and your registration was not sent. Please try again, or call us at 780-761-0245.");
            return;
        }
    }

    sessionStorage.setItem("sevenStonesRegistration", JSON.stringify({
        data: data,
        emailSent: emailSent
    }));

    window.location.href = "submitted.html";
});