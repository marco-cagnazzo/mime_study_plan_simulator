# MIME Study Plan Simulator

A lightweight, client-side web application designed to help students of the **Master's Degree in ICT for Internet and Multimedia (MIME)** at the University of Padua simulate, configure, and validate their academic study plan.

The tool guides students through their respective cohort regulations, curriculum tracks, mandatory courses, core/integrative options, and free-choice electives.

---

> ### ⚠️ Important Disclaimer
>
> **This application is an unofficial, informational aid and is NOT an official platform of the University of Padua.**
>
> * **No Guarantee of Approval**: Successfully configuring or validating a plan with this simulator **does not guarantee** its formal approval on UniWeb or by the University.
> * **Discretion of the Educational Committee**: While Automatic Study Plans (ASP) follow predefined programmatic rules, any deviation or Proposed Study Plan (PSP) remains **strictly subject to the formal review and discretion of the Study Plan Committee** (Commissione Didattica).
> * **Official Source of Truth**: Always refer to the official [MIME Didactic Regulations](https://mime.dei.unipd.it/), the [STEM e-learning platform](https://stem.elearning.unipd.it/), and UniWeb for binding requirements, deadlines, and submissions.

---

## Features

* **Multi-Cohort Support**: Tailors track structures and eligible courses depending on the student's enrollment year (coorte).
* **Track-Specific Wizard**:
  * **Step 0 (Cohort)**: Select your enrollment year.
  * **Step 1 (Track & Mandatory)**: Displays locked mandatory courses (including 12-CFU integrated courses) and soft-skill choices.
  * **Step 2 (Core Courses / Caratterizzanti)**: Presents eligible track core subjects and validates the required course count.
  * **Step 3 (Integrative Courses / Affini)**: Filters out already selected courses and ensures group requirements are met.
  * **Step 4 (Electives / A scelta libera)**: Pools all eligible, unselected MIME courses to allocate the 12 CFU free-choice requirement.
  * **Step 5 (Summary & Validation)**: Live checking of legal constraints (total CFUs, SSD distributions) and an export/print view.
* **Zero Infrastructure Overhead**: 100% static HTML5/CSS3/JavaScript. No backend, database, or server runtime required.

---

## Supported Degree Programs & Scope

While primarily maintained for the **Master's Degree in ICT for Internet and Multimedia (MIME)**, the underlying logic is built to illustrate curriculum design across information engineering disciplines at the Department of Information Engineering (DEI), including:
* *MSc in ICT for Internet and Multimedia (MIME)*
* *BSc in Ingegneria delle Telecomunicazioni, Internet e Multimedia*
* *BSc in Ingegneria Informatica*
* *BSc in Ingegneria Elettronica*

---

## Local Setup & Development

No build step or Node/Python dependencies are strictly required. You can clone the repository and run it with any static web server:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/](https://github.com/)<your-username>/mime-study-plan-simulator.git
   cd mime-study-plan-simulator
