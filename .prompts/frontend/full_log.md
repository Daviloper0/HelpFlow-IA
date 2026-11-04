[1] In the front end, on the failed test analisys window, there should also be a recieved response. Now, it's only, request and expected value, so add that other one. 

[2] Now, again, on the failed test analyisys window, there should be a standarized prompt that says what's expected, what was the request and what was the given response. There is no need to analyze, but the prompt should be in such way that doesn't matter what error or what request is given, it will help in development

[3] And now I want the analysis window to close when clicked outside.

[4] Now, add a button on the right of the section title "Testes que falharam na última execução" that copies all the tests that failed, no need for aditional text, only the request sent, expected response and actual response received.

[5] There are a couple of problems with the tests that were created and how it is shown to the user. When the body isn't equal to what's expected, in the analysis window, the recieved HTTP code (such as 200) appears as red, even if it's equal to the status. You should make the background red for what is mismatching, not always for the http code. The second problem is that you are using users that do not exist. So either you first create them, and use their user to create a ticket, for example, or you create a test user in the database.

[6] Now, below the failed tests section, create a collapsed section that is "Testes que passaram na última execução". The title must be the same size, and same font as the "Testes que falharam na última execução", and the collpased section must be below the title, hidden. There should be a toggle button on the right side of the title, that expands and unhidden the section. When expanded, the section must look exactly like the failed tests section, but with all tests that passed. If a user clicks on the test that passed, a analysis window should open, exactly like the failed tests section. If the user clicks the toggle button again, it should hide the passed tests section. If something is not clear, ask for clarification.

[7] All tests that are passing do not contain any body from server, even when it should. An example is the "Rejeitar email duplicado" test, that should reject duplicate emails. In the serverside, it does throw 409 error, but there is a message in the body, with a message, the error for that example is "email_already_exists" and the message is "Email já cadastrado". So either we aren't recieving the body or we aren't storing it in the tests section.

[8] There is another problem with the passed tests. They aren't expecting any body yet, but they recieve a body, and the test pass anyways. The test must only pass if the expected body is equal to the recieved body. And if it's not, then highlight the recieved body as red, with the same color scheme as the wrong recieved status.

[9] Now, simillarly to the passing tests section, create a colpase button near the "Copiar falhas" button, on the right side. There should be a gap between the two buttons. All the failed tests must start collapsed by default, and the button must behave like the passing tests button.

