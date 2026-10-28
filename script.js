
const form = document.getElementById("applicationForm");
const applicationsList = document.getElementById("applicationsList");
const searchInput = document.getElementById("searchInput");
const filterStatus = document.getElementById("filterStatus");

// Charger les candidatures sauvegardées
let applications = JSON.parse(
    localStorage.getItem("jobtrack-applications") || "[]"
);

let editingId = null;

// Sauvegarder les données
function saveApplications() {
    localStorage.setItem(
        "jobtrack-applications",
        JSON.stringify(applications)
    );
}

// Afficher les statistiques
function updateStatistics() {
    document.getElementById("totalApplications").textContent =
        applications.length;

    document.getElementById("pendingApplications").textContent =
        applications.filter(app => app.status === "Envoyée").length;

    document.getElementById("interviewApplications").textContent =
        applications.filter(app => app.status === "Entretien").length;

    document.getElementById("acceptedApplications").textContent =
        applications.filter(app => app.status === "Acceptée").length;
}

// Afficher les candidatures
function displayApplications() {
    const search = searchInput.value.trim().toLowerCase();
    const selectedStatus = filterStatus.value;

    const filteredApplications = applications.filter(app => {
        const matchesSearch =
            app.company.toLowerCase().includes(search) ||
            app.position.toLowerCase().includes(search);

        const matchesStatus =
            selectedStatus === "Tous" || app.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    applicationsList.replaceChildren();

    if (filteredApplications.length === 0) {
        const message = document.createElement("p");
        message.className = "empty-message";
        message.textContent = applications.length === 0
            ? "Aucune candidature pour le moment."
            : "Aucun résultat trouvé.";

        applicationsList.appendChild(message);
        return;
    }

    filteredApplications.forEach(app => {
        const card = document.createElement("article");
        card.className = "application-card";

        const info = document.createElement("div");
        info.className = "application-info";

        const company = document.createElement("h3");
        company.textContent = app.company;

        const position = document.createElement("p");
        position.textContent = app.position;

        const date = document.createElement("p");
        date.className = "application-date";
        date.textContent = `Date : ${app.date}`;

        const status = document.createElement("span");
        status.className =
            "status status-" + app.status.normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .replace(/\s+/g, "-");
        status.textContent = app.status;

        info.append(company, position, date, status);

        const actions = document.createElement("div");
        actions.className = "application-actions";

        if (app.link) {
            const link = document.createElement("a");
            link.href = app.link;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "Voir l'offre";
            actions.appendChild(link);
        }

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Modifier";
        editButton.addEventListener("click", () => editApplication(app.id));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Supprimer";
        deleteButton.className = "delete-button";
        deleteButton.addEventListener("click", () => deleteApplication(app.id));

        actions.append(editButton, deleteButton);
        card.append(info, actions);
        applicationsList.appendChild(card);
    });
}

// Ajouter ou modifier une candidature
form.addEventListener("submit", event => {
    event.preventDefault();

    const company = document.getElementById("company").value.trim();
    const position = document.getElementById("position").value.trim();
    const date = document.getElementById("applicationDate").value;
    const link = document.getElementById("offerLink").value.trim();
    const status = document.getElementById("status").value;

    if (!company || !position || !date) {
        alert("Veuillez remplir les champs obligatoires.");
        return;
    }

    if (editingId !== null) {
        applications = applications.map(app =>
            app.id === editingId
                ? { ...app, company, position, date, link, status }
                : app
        );
        editingId = null;
        form.querySelector('button[type="submit"]').textContent =
            "Ajouter la candidature";
    } else {
        applications.push({
            id: crypto.randomUUID(),
            company,
            position,
            date,
            link,
            status
        });
    }

    saveApplications();
    form.reset();
    displayApplications();
    updateStatistics();
});

// Préparer une candidature pour modification
function editApplication(id) {
    const app = applications.find(item => item.id === id);
    if (!app) return;

    document.getElementById("company").value = app.company;
    document.getElementById("position").value = app.position;
    document.getElementById("applicationDate").value = app.date;
    document.getElementById("offerLink").value = app.link;
    document.getElementById("status").value = app.status;

    editingId = id;
    form.querySelector('button[type="submit"]').textContent =
        "Enregistrer les modifications";

    form.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Supprimer une candidature
function deleteApplication(id) {
    if (!confirm("Voulez-vous vraiment supprimer cette candidature ?")) {
        return;
    }

    applications = applications.filter(app => app.id !== id);

    if (editingId === id) {
        editingId = null;
        form.reset();
        form.querySelector('button[type="submit"]').textContent =
            "Ajouter la candidature";
    }

    saveApplications();
    displayApplications();
    updateStatistics();
}

// Recherche et filtres
searchInput.addEventListener("input", displayApplications);
filterStatus.addEventListener("change", displayApplications);

// Initialisation
displayApplications();
updateStatistics();
