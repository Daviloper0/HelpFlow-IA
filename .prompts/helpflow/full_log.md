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


