[1] In the front end, on the failed test analisys window, there should also be a recieved response. Now, it's only, request and expected value, so add that other one. 

[2] Now, again, on the failed test analyisys window, there should be a standarized prompt that says what's expected, what was the request and what was the given response. There is no need to analyze, but the prompt should be in such way that doesn't matter what error or what request is given, it will help in development

[3] And now I want the analysis window to close when clicked outside.

[4] Now, add a button on the right of the section title "Testes que falharam na última execução" that copies all the tests that failed, no need for aditional text, only the request sent, expected response and actual response received.

[5] There are a couple of problems with the tests that were created and how it is shown to the user. When the body isn't equal to what's expected, in the analysis window, the recieved HTTP code (such as 200) appears as red, even if it's equal to the status. You should make the background red for what is mismatching, not always for the http code. The second problem is that you are using users that do not exist. So either you first create them, and use their user to create a ticket, for example, or you create a test user in the database.

[6] Now, below the failed tests section, create a collapsed section that is "Testes que passaram na última execução". The title must be the same size, and same font as the "Testes que falharam na última execução", and the collpased section must be below the title, hidden. There should be a toggle button on the right side of the title, that expands and unhidden the section. When expanded, the section must look exactly like the failed tests section, but with all tests that passed. If a user clicks on the test that passed, a analysis window should open, exactly like the failed tests section. If the user clicks the toggle button again, it should hide the passed tests section. If something is not clear, ask for clarification.

[7] All tests that are passing do not contain any body from server, even when it should. An example is the "Rejeitar email duplicado" test, that should reject duplicate emails. In the serverside, it does throw 409 error, but there is a message in the body, with a message, the error for that example is "email_already_exists" and the message is "Email já cadastrado". So either we aren't recieving the body or we aren't storing it in the tests section.

[8] There is another problem with the passed tests. They aren't expecting any body yet, but they recieve a body, and the test pass anyways. The test must only pass if the expected body is equal to the recieved body. And if it's not, then highlight the recieved body as red, with the same color scheme as the wrong recieved status.

[9] Now, simillarly to the passing tests section, create a colpase button near the "Copiar falhas" button, on the right side. There should be a gap between the two buttons. All the failed tests must start collapsed by default, and the button must behave like the passing tests button.

[10] The expectedBody must be equal to the recieved body for the test to pass. No additional fields at all. An example is on the post of a unknown category, it expects {"category": "Other"}, but recieves {"assignedTo":null,"category":"Other","createdBy":"7f856fb4-88f9-4788-8097-61bcf463509a","description":"Desc","id":9,"priority":"Low","status":"Open","title":"Problema"}
and the test still pass, when it shouldn't.

The test MUST only pass when the bodies are equal. If the test doesn't expect a body and it recieves a body, it must be treated as a test that didn't pass.

[11] Change the background color of the system resume for yellow, when either (the test passes and the API docs aren't available) or (The docs exists and is validated, but there are tests that do not pass)

[12] Now, there should be a new module called statistics, place it right below the "Analysis" module, on the left pannel, and give it a meaningful emoji too.

In that Statistics module, there should be a table that gather all the run suits (not all individual tests, but only the run suits), and put it in a table. The table should display a maximum of 10 suits per once. The table must have the following columns: how many tests, how many failed and how many passed, if all tests failed and the test right before it didn't, then there should be a warning, that suggests that HelpFlow server could be offline, hence this is why it isn't passing any tests. The table should have alternating colors, and shouldn't change the background when a test pass or not. There should be a way to hide a test suit line from the table, and the consequences of doing so is that there will be graphs that measure how the tests are doing, and when it's turned off, the graphs will ignore that line in the statistics section. Give me suggestions about other columns that could be in a test suit table.

[13] The left pannel, that helps user navigate throughout the application should stay fixed, that means that when a user roll down the page, he should still be able to see the modules.

[14] The table must be a simplified mode, that shows the date, total, approved and fails, and the hide button. If the user wants more, there should be a button that opens a analysis window, with the amplified view. There shouldn't be a "Mostrar ocultas" button, as I said, it will still be shown on the table, just not on other things we will work on.

In full mode it should show everything.

[15] First, the header text should be bold and it's background must be in a different color, perhaps the same as the left pannel. The total, approved and fails looks disaligned from it's content. On that table, I want to see a vertical bar that separates each column. It must be symetric, like a real spreadsheet. The Hide Show Button must have a "Esconder" to hide and a "Mostrar" text to show. When Hidden, it must be kinda of grayed out, but shouldn't be the same background color as the background. And choose other colors to alternate, but the text should have enough contrast to the green and red and common font color. The details section is ok.

[16] All columns and lines are aligned, except for date/time. Before fixing it, tell me why that happned

[17] It works great, now about the visibility button. It should have a fixed length and height. It shouldn't have any color on the background at all.

[18] Remove the "Oculta" label from the lines that are hidden, the color should be enough to tell it's hidden. Also, the "Ver detalhes" button should change the color to a more transparent one, kinda like the "Mostrar" button.

[19] Make the header blue, kinda like the F from helpflow #0070FD, and the alternating color, the one in the even row must be blue too, not a color of grey. But when it's hidden it should be gray anyways

[20] Ok, the helpflow Blue doesn't look good, change it to another color, that matches the soft blue tint better

[21] The text in the buttons when the row is hidden, should be the same as the text

[22] Now, there should be a "Histórico" Title, right before the table, and the table shouldn't use more than 50% of the statistics module, unless on mobile

[23] You can change the max width of the whole app. it looks good

[24] Why are you hardcoding a max-width? That doesn't make sense at all, just remove it.

[25] The histórico title could be bigger, perhaps the same size of "Testes que falharam na última execução" section title

[26] Now, I have some questions, I want to create some graphs, that give some statistics, like: How many tests were run (all time, except for hidden) a number, only, how many passed and how many failed, total duration, etc, based on all tests, and on the detailed statics they give.

Questions: Besides the statistics inside the detailed section, are there more statistics that could be useful? 
Second question: How could we organize all those statistics? So they use the page well

[27] I like the layout suggestion, I just want a mean of the mean duration of the tests, slowest test on the last ran test.

[28] The all time passed and all time failed could be in a donut chart, streak doesn't interest me. And what is total duration?

[29] The passrate over time is a percentage, right? But in a line chart? Because if I add more tests, then an absolute number won't work well.

[30] The donut could be on the KPI row, couldn't it? Give me reasons for it not to be in the KPI

And what is the regressed tests section?

[31] It interests me. Any other important statistics that should be visible?

[32] I like the trend arrow, and the first time seen failing is also good, how would the layout be after those changes?

[33] Don't do the first seen failing yet. But start with the rest. Don't change anything in other modules, but if you need to, ask for permission.

[34] First, let's talk about the cards of the KPI, the numbers should be in center, and bigger, taking almost as much space as they can, but giving a small gap between the kpi title and the little explanation below it. 

[35] Now, the slowest test section isn't actually gathering the slowest test. The slowest test card should make it clear that it is the slowest test from the last ran suit, and don't make the test name cropped unless there is no space. No forced cut.

[36] Below 815px, the side pannel uses all the width for some reason, leaving no space for the rest of the modules, fix it. And also, for some reason, the donut chart appears. If it's in a phone sized window, then the modules should be on the bottom, fixed, like a mobile app. 

[37] On a small screen, don't show the "HelpFlow" or "Painel de desenvolvimento" text, nor the logo

[38] Why is the "Testes mais problematicos" table with it's size fixed? Make it use all the allowed width. And after 768px, the history table only takes like 50% of the width, even when it's not side by side with the "Taxa de aprovação" Graph. Change it, it should take the whole window. It should just start sharing space with the "Taxa de aprovação" graph when the window size is at least 1500px..

[39] The Taxa de aprovação graph is too big, it should be the same height as the history when widith > 1500px

[40] The "Taxa de aprovação" is still too big, it should grow at the same time as the history table. If something is not clear, ask me

[41] The history should have a maximum of 5 test suits, and the history should dictate the size of the row.

[42] I have a better idea, let's make the height of both fixed when the width is more than 1500px

[43] No, change the table to use 500px, 280px isn't enough at all.

[44] 280px for the table is actually good, you can set it ONLY FOR THE TABLE AND THE GRAPH, not the whole section.

[45] I didn't say the history section, I meant ONLY and ONLY the table, the table element. and the chart.

[46] Actually, 300px seems better.

[47] There is a big problem with the "Taxa de aprovação" graph. First tell me, are you inventing this graph or is it a library?






