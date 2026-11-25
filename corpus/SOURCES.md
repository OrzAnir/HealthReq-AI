# Document Corpus Sources

Every `.md` and `.txt` file in the `healthcare/`, `security/` and `sdlc/` folders is indexed for BM25 search when the app starts. Paths below are relative to `corpus/`.

| Folder | Document | Publisher / origin | Licence | Used by |
| --- | --- | --- | --- | --- |
| `healthcare/itrust2/` | iTrust2 Requirements, Version 4 (January 2019): `Requirements.md` and use cases `UC1.md` to `UC26.md` | NC State University, iTrust2 open-source electronic health record system, branch `v6`, commit `0b308e57`: https://github.com/ncsu-csc326/iTrust2/tree/v6/docs | Eclipse Public License 2.0 (`healthcare/itrust2/LICENSE`); files copied unchanged | Requirements Writer |
| `security/` | The NIST Cybersecurity Framework (CSF) 2.0, NIST CSWP 29, February 2024 (text extracted from the PDF) | NIST: https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf | US Government work, public domain | Requirements Writer |
| `sdlc/` | SDLC reference notes: Waterfall, V-Model, Spiral, Agile, DevSecOps, hybrid models, decision factors, healthcare considerations | Written for this project as a summary of standard software engineering textbook material (Sommerville; Pressman) | Project material | SDLC Advisor |

## iTrust2 use cases included

UC1 User Functionality, UC2 Authenticate Users, UC3 Log Transactions, UC4 Demographics, UC5 Hospitals, UC6 Appointments, UC7 Office Visit, UC8 Basic Health Metrics, UC9 Prescriptions, UC10 Diagnoses, UC11 Password Functionality, UC12 HCP Edit Demographics, UC13 View Access Logs, UC14 Alert Users by Email, UC15 Emergency Health Records, UC16 Personal Representatives, UC17 Lab Procedures, UC18 Vaccinations, UC19 Food Diary, UC20 Ophthalmology Appointment Requests, UC21 Ophthalmologist Appointment, UC22 Ophthalmology Surgeries, UC23 Office Visit Satisfaction Survey, UC24 Diabetes Testing, UC25 Blood Sugar Tracking, UC26 Find an Expert.

## Limitations

The documents are evidence for generating draft requirements, not legal or medical advice. Generated requirements and the SDLC recommendation must be reviewed and approved by a person.
