import React from "react";
import AddCD from "./AddCD";

describe("<AddCD />", () => {
  it("renders the component correctly", () => {
    const onAddMock = cy.stub().as("onAddHandler");
    cy.mount(<AddCD onAdd={onAddMock} />);

    cy.contains("h2", "Ajouter un CD").should("be.visible");

    cy.get('input[name="title"]')
      .should("be.visible")
      .and("have.attr", "placeholder", "Titre du CD");

    cy.get('input[name="artist"]')
      .should("be.visible")
      .and("have.attr", "placeholder", "Artiste");

    cy.get('input[name="year"]')
      .should("be.visible")
      .and("have.attr", "placeholder", "Année");

    cy.contains("button", "Ajouter").should("be.visible");
  });

  it("allows entering data in form fields", () => {
    cy.mount(<AddCD onAdd={() => {}} />);

    cy.get('input[name="title"]')
      .type("Test Album")
      .should("have.value", "Test Album");

    cy.get('input[name="artist"]')
      .type("Test Artist")
      .should("have.value", "Test Artist");

    cy.get('input[name="year"]').type("2025").should("have.value", "2025");
  });

  it("validates required fields", () => {
    cy.mount(<AddCD onAdd={() => {}} />);

    cy.get("form").submit();

    cy.get('input[name="title"]:invalid').should("exist");

    cy.get('input[name="title"]').type("Test Album");
    cy.get("form").submit();

    cy.get('input[name="artist"]:invalid').should("exist");

    cy.get('input[name="artist"]').type("Test Artist");
    cy.get("form").submit();

    cy.get('input[name="year"]:invalid').should("exist");

    cy.get('input[name="year"]').type("2025");

    cy.get("form").submit();

    cy.get('input[name="title"]').should("have.value", "");
  });
});
