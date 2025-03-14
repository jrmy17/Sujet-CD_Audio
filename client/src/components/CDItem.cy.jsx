import React from "react";
import CDItem from "./CDItem";

describe("<CDItem />", () => {
  it("renders the component correctly", () => {
    const testCD = {
      id: 1,
      title: "Test Album",
      artist: "Test Artist",
      year: 2025,
    };

    const onDeleteMock = cy.stub().as("onDeleteHandler");

    cy.mount(<CDItem cd={testCD} onDelete={onDeleteMock} />);

    cy.contains(`${testCD.title} - ${testCD.artist} (${testCD.year})`).should(
      "be.visible"
    );

    cy.get("button.delete-btn")
      .should("be.visible")
      .and("contain", "🗑 Supprimer");
  });

  it("calls onDelete when delete button is clicked", () => {
    const testCD = {
      id: 123,
      title: "Delete Test Album",
      artist: "Delete Test Artist",
      year: 2025,
    };

    const onDeleteMock = cy.stub().as("onDeleteHandler");

    cy.mount(<CDItem cd={testCD} onDelete={onDeleteMock} />);

    cy.get("button.delete-btn").click();

    cy.get("@onDeleteHandler").should("have.been.calledWith", testCD.id);
  });
});
