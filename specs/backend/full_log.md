[1] Analyze the entire HelpFlow Haskell codebase and identify all API routes, HTTP methods, request and response types, validation rules, business logic, and possible error responses.

Compare this information with the existing registered tests in the dashboard. Identify missing coverage, prioritizing positive tests for every route (valid requests that exercise the expected successful behavior). Also add relevant negative tests for invalid inputs, validation failures, and expected errors.

For each missing test:

Define the name, HTTP method, endpoint, description, request headers and body when applicable.

Specify the expected HTTP status code and response validation criteria.

Assign an appropriate category, such as success, input validation, or expected error.

Follow the actual implementation and business rules. Do not invent routes, request fields, response structures, or expected behavior. If something cannot be determined from the code, explicitly flag it for review.

Avoid duplicating existing tests. If possible, create the missing test cases in the dashboard's existing format. Otherwise, provide them in a structured format that can be imported or added easily.

Finally, summarize the routes analyzed, existing coverage, missing tests, and any uncertainties. Do not claim tests pass until they have actually been executed against the running API.

[2] All your tests that you added now are with   in everywhere that has some kind of accent, it didn't happen before. Also, all your tests didn't work. Check again if you understood how the tickets flow work. You are trying to promote an user that don't even exist. The same happens for tickets.

[3] Below are all tests that fail. For each one, investigate and analyze why it isn't passing the test. Do not change any code, unless you ask for permission. Explain your decisions.

[4] Now, all the tests are failing because the body is not what it's expecting. The API code structure is the following, when it's an error:
{
    "errorCode":"ERROR_MESSAGE_IN_UPPERCASE",
    "errorMessage":"Error description"
}

If you don't have the possible errorMessages, ask me, but the errorCodes are correct, so you only need to add the errorMessage to the expected body section of the tests

[5] Now that the test suit is WORKING, let's fix the register valid user test. The problem with it is that it can't create the same user twice. To fix that, add a timestamp to the email, so that it's never the same.

[6] Don't show the template, show the actual request that is being sent to the server. It's working now.

[7] The following tests are failing. To fix them, change the expected body as I say:

* Criar ticket válido: The server expects an object, like the following:
{"assignedTo":null,"category":"Printer","createdBy":"7f856fb4-88f9-4788-8097-61bcf463509a","description":"A impressora do 3º andar parou de imprimir","id":18,"priority":"High","status":"Open","title":"Impressora não funciona"}

* Rejeitar createdBy inválido no ticket: The server expects an error message:
Error in $: Invalid userId

* Rejeitar priority inválida no ticket: The server expects an error message:
Error in $.priority: Invalid priority

* Categoria desconhecida cai em Other: The server expects:
{"assignedTo":null,"category":"Other","createdBy":"7f856fb4-88f9-4788-8097-61bcf463509a","description":"Desc","id":17,"priority":"Low","status":"Open","title":"Problema"}

[8] There are a couple of problems with my approach of being exactly the same object. Especially because of the ID, as it is incremental, it will never be the same. Perhaps verify every item of the object, except for the ID. If you think another approach is better, than ask me.

[9] Now, there is another problem with the tests, most use a ticket that was already asigned, the problem with that approach is that it doesn't give the expected error, instead, the system returns:

{"errorCode":"TICKET_NOT_AVAILABLE","errorMessage":"Ticket is not available, maybe it doesn't exist or it's already assigned"}

So, on the ticket tests there should be a non assigned ticket. So, before testing that, create a ticket, try to do all the tests that must be rejected and after that, try to do assign to a valid technician.

[10] Now, change the following tests:
"Rejeitar priority inválida no ticket" to expect:
{"errorCode":"INVALID_PRIORITY","errorMessage":"Invalid priority, valid values are: Low, Normal, High"}

and 

"Rejeitar createdBy inválido no ticket" to expect {"errorCode":"INVALID_USER_ID","errorMessage":"Invalid userId"}

[11] There is a problem with the "Promover Customer a técnico com sucesso", you can't promote a customer twice

[12] Now, the "Promover Customer a técnico com sucesso" test is failing, because the user is already a technician. To fix that, use a valid user id, perhaps the one you already created in the tests. If you can't gather one, then tell me. 

[13] I've done the changes in the backend, now, the registerRequest also returns the ID. So, after creating the user, you can use it. An example of how the server will answer is:

{"responseMessage":"Usuário registrado com sucesso","responseUserId":"1f1a76b3-e854-488b-8cc7-59dc2a6905e5"}

Now retry to do the promoteToTechnician test, and also, change what the valid register test is expected to recieve, using the JSON before this paragraph. Remember that IDs change all the time, so it shouldn't be fixed to one ID

[14]  The login test should also be updated, as it also returns a loginUserId, for example: {"loginMessage":"Login realizado com sucesso","loginUserId":"4b53bd08-d1c8-4c00-813e-e336397bd050"}

[15] Both login and register tests are working back again. But the promote Customor to technician test is not working, the server is returning Invalid UserId. Fix that error.

[16] Again, the server is still returning invalid userId. Retry

[17] Nothing is printed on the console. And the user Id is still invalid, but don't work on that yet, just remember that the problem is still not solved. The "Rejeitar ticketId não numérico na atribuição" should expect {"errorCode":"INVALID_TICKET_ID","errorMessage":"Invalid ticketId"} and "Rejeitar ticketId não numérico na solução" should also expect the same.

[18] The following tests are failing, understand why.

For every test that involves a ticket, I want to see what is the real ticket id, not only a place holder. But just for debugging. What you've done didn't help at all

[19] It works now, but it shouldn't only be a single call, you have to run firstly the required tests, such as valid register, login, create ticket, and all the other ones, should be run after, in multiple calls, so that the number increases second by second. Ask me, if in any doubts

[20] Don't do that, you can keep it simple, just run the importants first and then the rest. Say your approach and ask for permission to continue.

[21] Now, finally, change the "Promover Customer a técnico com sucesso" expected request to {"responseMessage":"User is now a technician","responseUserId":"{{userId}}"}
