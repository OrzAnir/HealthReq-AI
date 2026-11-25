# Healthcare software considerations

Healthcare software processes protected health information, so privacy, access control, audit logging and data integrity are core requirements, not optional extras.

Software that is part of, or acts as, a medical device is normally developed under the IEC 62304 standard for medical device software life-cycle processes, which requires planned development, requirements analysis, verification, risk management and traceability. This matches the strengths of the V-Model.

Agile methods can still be used in regulated healthcare development if the required verification evidence and documentation are produced; the AAMI TIR45 technical report gives guidance on using Agile practices for medical device software.

Administrative healthcare features with lower patient-safety impact, such as appointment booking or patient surveys, change more often with user feedback and suit Agile delivery, while clinical and safety-critical features such as prescriptions, lab results and emergency records need stronger verification.

For these reasons healthcare projects commonly use a hybrid: Agile iterations for delivery speed combined with V-Model verification and validation, DevSecOps security automation, and human approval before release.

Source: SDLC reference notes written for this project, summarising standard software engineering textbook material (Sommerville; Pressman).
