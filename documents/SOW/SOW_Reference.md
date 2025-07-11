# SOW Creation Guidelines & Template

## Introduction
- This document serves as a guideline for the AI. The final SOW output itself should be generated in Japanese as requested.

## Workflow
This project uses a folder-based system to manage the status of SOWs.

- **`backlog/`**: For newly created SOWs that are not yet started. The AI should place all new SOW outputs into this directory.
- **`working/`**: For SOWs that are currently in progress. Manually move files from `backlog` to here when work begins.
- **`done/`**: For SOWs related to completed projects. Manually move files from `working` to here upon completion.

When a file is moved, the `status` field in its YAML front matter should also be updated to reflect the new state (e.g., `Todo`, `In Progress`, `Done`).

## 1. Guiding Principles for SOW Creation
- **Clarity:** Use clear language that can be interpreted in only one way, avoiding jargon.
- **Specificity:** Be specific and list all items. Avoid ambiguous terms like "etc." or "and so on."
- **Comprehensiveness:** All sections in the template below should be filled out. If a section is not applicable, explicitly state "N/A" or "Out of Scope."

## 2. SOW Template
(The AI will use the following template to structure the Statement of Work.)
---

### SOW (Statement of Work)

---
project_name: "[Project Name]"
status: "Todo" # Todo, In Progress, Done, Canceled
owner: "[Owner Name]"
created_at: "YYYY-MM-DD"
updated_at: "YYYY-MM-DD"
---
- 日付は、DATEコマンドを用いて正確に入力すること

- **Project Name:** `[Project Name]`
- **Creation Date:** `YYYY-MM-DD`
- **Revision History:**
  - `v1.0 (YYYY-MM-DD): Initial draft`

#### 1. Project Purpose & Background
*Briefly describe why this project is necessary and what problems it aims to solve or achieve.*

#### 2. Scope of Work
*List all tasks and activities that "will be done" in this project. Be specific and clear.*
- 
- 

#### 3. Out of Scope
*Clearly list all tasks and activities that "will not be done." This is crucial for preventing scope creep.*
- 
- 

#### 4. Deliverables
*List all items that will be delivered upon project completion. Specify formats and versions where applicable.*
- **Design-related:**
  - RequirementsDefinition.md
- **Implementation-related:**
  - Complete source code (GitHub repository)
- **Other:**
  - TestReport.pdf

#### 5. Assumptions & Constraints
- **Assumptions:** (Conditions that are assumed to be true for the project to proceed. e.g., "Client will provide all necessary API keys.")
- **Constraints:** (Limitations such as technology, budget, or time.)

#### 6. Team & Roles
- **Client-side:**
  - Project Lead: `[Name]`
- **Vendor/Developer-side:**
  - Assigned to: `[Name]`

#### 7. Schedule
*Define key milestones and their deadlines.*
- **Kick-off:** `YYYY-MM-DD`
- **Requirements Definition Complete:** `YYYY-MM-DD`
- **Final Delivery:** `YYYY-MM-DD`

#### 8. Acceptance Criteria
*Define the specific criteria that must be met for the deliverables to be considered "complete" and accepted.*
- Example: All pre-agreed test cases must pass.
- Example: Core features must be confirmed to operate correctly in the production environment.

#### 9. Change Log
*Record any changes made to this SOW after its initial approval.*
- **YYYY-MM-DD (v1.1) by [Name]:**
  - **Reason for Change:** [Briefly describe why the change was necessary.]
  - **Details of Change:** [List the specific changes made.]

---

## 3. Good SOW Checklist
- [ ] Is the "Out of Scope" section clearly defined?
- [ ] Are the "Deliverables" listed specifically?
- [ ] Are the "Acceptance Criteria" objective and measurable?
- [ ] Have ambiguous terms been avoided?

## 4. Glossary
- **XXX:** (Define any project-specific terms or acronyms here.)
