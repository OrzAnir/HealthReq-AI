# V-Model (Verification and Validation model)

The V-Model extends Waterfall by pairing every development phase with a matching test phase. Requirements are paired with acceptance testing, system design with system testing, architecture with integration testing, and module design with unit testing. Test plans are written at the same time as the matching development phase.

Strengths: verification and validation are planned from the start; strong traceability from each requirement to its tests; defects are found early; widely used in safety-critical and regulated domains such as medical devices, automotive and aerospace.

Weaknesses: as rigid as Waterfall; changing requirements forces rework of both the design and the test plans; little working software is seen early.

Choose the V-Model when the system is safety-critical or heavily regulated, failures can harm people, and every requirement must be verified and traceable to a test. Avoid it when requirements change often.

Source: SDLC reference notes written for this project, summarising standard software engineering textbook material (Sommerville; Pressman).
