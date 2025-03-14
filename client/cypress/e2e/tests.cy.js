describe("CD Audio Application", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173");

    cy.intercept("GET", "http://localhost:5005/api/cds").as("getCDs");
  });

  it("should display the list of CDs", () => {
    cy.contains("h1", "Gestion des CD").should("be.visible");
    cy.contains("h2", "Liste des CD").should("be.visible");

    cy.wait("@getCDs");
  });

  it("should add a new CD", () => {
    const newCD = {
      title: "Album de Test",
      artist: "Artiste de Test",
      year: "2025",
    };

    cy.intercept("POST", "http://localhost:5005/api/cds", {
      statusCode: 201,
      body: { id: 999, ...newCD },
    }).as("addCD");

    cy.intercept("GET", "http://localhost:5005/api/cds", (req) => {
      req.reply({
        statusCode: 200,
        body: [
          {
            id: 999,
            title: newCD.title,
            artist: newCD.artist,
            year: Number(newCD.year),
          },
        ],
      });
    }).as("getUpdatedCDs");

    cy.contains("h2", "Ajouter un CD").should("be.visible");
    cy.get('input[name="title"]').type(newCD.title);
    cy.get('input[name="artist"]').type(newCD.artist);
    cy.get('input[name="year"]').type(newCD.year);

    cy.get("form").contains("Ajouter").click();

    cy.wait("@addCD");

    cy.wait("@getUpdatedCDs");

    cy.contains(`${newCD.title} - ${newCD.artist} (${newCD.year})`).should(
      "be.visible"
    );
  });

  it("should delete a CD", () => {
    cy.intercept("GET", "http://localhost:5005/api/cds", {
      statusCode: 200,
      body: [
        {
          id: 1,
          title: "Album à Supprimer",
          artist: "Artiste Test",
          year: 2025,
        },
      ],
    }).as("getInitialCDs");

    cy.visit("http://localhost:5173");
    cy.wait("@getInitialCDs");

    cy.contains("Album à Supprimer - Artiste Test (2025)").should("be.visible");

    cy.intercept("DELETE", "http://localhost:5005/api/cds/*", {
      statusCode: 204,
    }).as("deleteCD");

    cy.intercept("GET", "http://localhost:5005/api/cds", {
      statusCode: 200,
      body: [],
    }).as("getAfterDelete");

    cy.contains("li", "Album à Supprimer").within(() => {
      cy.get("button.delete-btn").click();
    });

    cy.wait("@deleteCD");

    cy.wait("@getAfterDelete");

    cy.contains("Album à Supprimer").should("not.exist");
    cy.contains("Aucun CD disponible").should("be.visible");
  });

  it("should perform the complete CD lifecycle (add, display, delete)", () => {
    cy.intercept("GET", "http://localhost:5005/api/cds", {
      statusCode: 200,
      body: [],
    }).as("getInitialCDs");

    cy.visit("http://localhost:5173");
    cy.wait("@getInitialCDs");

    cy.contains("Aucun CD disponible").should("be.visible");

    const newCD = {
      title: "Cycle de Vie",
      artist: "Artiste Complet",
      year: "2025",
    };

    cy.intercept("POST", "http://localhost:5005/api/cds", {
      statusCode: 201,
      body: { id: 100, ...newCD, year: Number(newCD.year) },
    }).as("addNewCD");

    cy.intercept("GET", "http://localhost:5005/api/cds", {
      statusCode: 200,
      body: [
        {
          id: 100,
          title: newCD.title,
          artist: newCD.artist,
          year: Number(newCD.year),
        },
      ],
    }).as("getCDsAfterAdd");

    cy.get('input[name="title"]').type(newCD.title);
    cy.get('input[name="artist"]').type(newCD.artist);
    cy.get('input[name="year"]').type(newCD.year);
    cy.get("form").contains("Ajouter").click();

    cy.wait("@addNewCD");

    cy.wait("@getCDsAfterAdd");

    cy.contains(`${newCD.title} - ${newCD.artist} (${newCD.year})`).should(
      "be.visible"
    );

    cy.intercept("DELETE", "http://localhost:5005/api/cds/*", {
      statusCode: 204,
    }).as("deleteNewCD");

    cy.intercept("GET", "http://localhost:5005/api/cds", {
      statusCode: 200,
      body: [],
    }).as("getCDsAfterDelete");

    cy.contains("li", newCD.title).within(() => {
      cy.get("button.delete-btn").click();
    });

    cy.wait("@deleteNewCD");

    cy.wait("@getCDsAfterDelete");

    cy.contains(newCD.title).should("not.exist");
    cy.contains("Aucun CD disponible").should("be.visible");
  });
});
