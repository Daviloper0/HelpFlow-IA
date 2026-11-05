[1] To fix the group one, I want you to implement not only the promote route, because that wouldn't be enough, but I actually want you to analyze the project strucutre, understand how the files are named, and create an actual way to promote. Respect all data kinds, types and type families. If there is something that could break, don't do it. Instead, ask for permission.

SALVO ENGANO, essa nem foi necessária, pois eu estava usando uma versão errada do helpflow, e depois de mudar, deu certo.

[2] There is a problem, if a invalid userId is sent or a invalid priority is sent, then there is no JSON response, the error sent is Error in $.priority: Invalid priority
or the userId equivalent. But there is no JSON response for those. Add an error code for those results.

[3] First, remove what you've done in the main.hs file. DO NOT WRITE IN THE MAIN.HS.

Second, the thing is that in the line 46 of the file CreateTicket.hs, if it can't create the ticket because of how the userId is created (Defined in the line 19 of the UserId.hs file in Domain/Identity). It expects a UUID as a text, but if a normal Text is given, then it can't create the User ID and the program gives a fail message (Invalid userId). But the thing is that I don't want that kind of message, I want a message just like in assignTicket, line 22:32.

[4] For the createdBy, it's working ok, but that change broke the reject invalid priority test. Add the InvalidPriority error.


[5] Now, create a demoteToUser in Application/Identity and on src/API. the PromoteToTechnician.hs in identity, should recieve an User -> User -> Io (Either DemoteError User). The promote error data type should have the following: NotAdministrator, UserNotFound and AlreadyUser.

In the API, demoteToUserHandler should be UserId -> User Id -> Handler RegisterResponse.

Do not import anything else, except if explicitly allowed.

[6] Now, when a user is created, the server should also return the user id, so it can be used on the application.

If you change something in the RegisterResponse, just remember that other files that are not part of the register, such as promote and demote also use them. Perhaps there is more, so check it. There is no problem with also returning the ID in both promote or demote, just don't forget to do the necessary changes after doing it.

[7] When the server recieves an invalid ticketId, it returns only Invalid ticketId, not a JSON, like it should. Add an error like INVALID_TICKET_ID to the tickets.

[8] Analyze how the AssignTicket is working when it recieves an UUID from the Front end, you should do the same for the PromoteToTechnician and in the ticket assignment (here it's called technicianId, but it is still a uuid)

[9] Now, create a file called PROBLEMS.md. This is where everytime you find a bug, you should log your solutions there too, so if the bugs happen again, you will know where not to look. It won't be read by a human, so, optimize the writing to not use a lot of tokens, as everytime you are solving a problem, you WILL look there, this is unnegotiable. So, the workflow is the following:
1. Someone tells you a bug
2. You ask questions to really understand the bug, so, when it happens, what happens, in what conditions, and so on
3. You look for it on the PROBLEMS.md file, if the bug doesn't exist, write it down, describing what's happening, in a way everytime you open that file, you can find a list of all the bugs you solved, or if it's not really a bug. If it does exist, understand the existing solutions, and what they solve, and what they don't.
4. Every solution you find, write on that file

What I don't want: 
1. A copy of what you said in the chat
2. A fake solution, an honest no is better

[10] I changed computers, and because of that, the users aren't the same. This is why some tests failed. But the thing is, doesn't matter if it's the first time running or the last.

E aí o claude pediu quais testes falharam, no qual respondi (essencialmente usei o dashboard para arrumar os testes)

* [1] PATCH /user/cab9e6ce-a004-4d13-988d-1378a52f55e1/promote/4b53bd08-d1c8-4c00-813e-e336397bd050
Requisição: (sem corpo)
Resposta esperada: status 409, {"errorCode":"ALREADY_TECHNICIAN","errorMessage":"User is already a technician"}
Resposta recebida: status 404, {"errorCode":"USER_NOT_FOUND","errorMessage":"Administrator not found"}

* [2] PATCH /user/4b53bd08-d1c8-4c00-813e-e336397bd050/promote/7f856fb4-88f9-4788-8097-61bcf463509a
Requisição: (sem corpo)
Resposta esperada: status 403, {"errorCode":"NOT_ADMINISTRATOR","errorMessage":"Only administrators can promote users to technician"}
Resposta recebida: status 404, {"errorCode":"USER_NOT_FOUND","errorMessage":"Administrator not found"}

* [3] PATCH /user/cab9e6ce-a004-4d13-988d-1378a52f55e1/promote/00000000-0000-0000-0000-000099999999
Requisição: (sem corpo)
Resposta esperada: status 404, {"errorCode":"USER_NOT_FOUND","errorMessage":"User not found"}
Resposta recebida: status 404, {"errorCode":"USER_NOT_FOUND","errorMessage":"Administrator not found"}

* [4] PATCH /user/cab9e6ce-a004-4d13-988d-1378a52f55e1/promote/{{registeredUserId}}
Requisição: (sem corpo)
Resposta esperada: status 200, {"responseMessage":"User is now a technician","responseUserId":"{{any}}"}
Resposta recebida: status 404, {"errorCode":"USER_NOT_FOUND","errorMessage":"Administrator not found"}

* [5] PATCH /ticket/{{assignedTicketId}}/solve
Requisição: (sem corpo)
Resposta esperada: status 200, {"assignedTo":"4b53bd08-d1c8-4c00-813e-e336397bd050","category":"Printer","createdBy":"7f856fb4-88f9-4788-8097-61bcf463509a","description":"A impressora do 3º andar parou de imprimir","id":"{{any}}","priority":"High","status":"Solved","title":"Impressora não funciona"}
Resposta recebida: status 400, {"errorCode":"INVALID_TICKET_ID","errorMessage":"Invalid ticketId"}

* [6] PATCH /ticket/{{createdTicketId}}/assign
Requisição: {"technicianId": "cab9e6ce-a004-4d13-988d-1378a52f55e1"}
Resposta esperada: status 400, {"errorCode":"USER_NOT_TECHNICIAN","errorMessage":"User is not a technician"}
Resposta recebida: status 404, {"errorCode":"USER_NOT_FOUND","errorMessage":"User not found"}

* [7] PATCH /ticket/{{createdTicketId}}/assign
Requisição: {"technicianId": "4b53bd08-d1c8-4c00-813e-e336397bd050"}
Resposta esperada: status 200, {"assignedTo":"4b53bd08-d1c8-4c00-813e-e336397bd050","category":"Printer","createdBy":"7f856fb4-88f9-4788-8097-61bcf463509a","description":"A impressora do 3º andar parou de imprimir","id":"{{any}}","priority":"High","status":"InProgress","title":"Impressora não funciona"}
Resposta recebida: status 404, {"errorCode":"USER_NOT_FOUND","errorMessage":"User not found"}

[11] The other test that failed was the "Rejeitar email duplicado", that don't show here, because i executed the test two times. But the first time, they fail. Don't forget to add the problem in problems.md, following the guideline in readme.md

[12] Can't we have an alternative? I can give you the credentials, but imagine doing that for every computer?

[13] Is there a way so that the first time a db is ran, it creates an admin with default password and user?
