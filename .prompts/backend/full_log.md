[1] Analyze the entire HelpFlow Haskell codebase and identify all API routes, HTTP methods, request and response types, validation rules, business logic, and possible error responses.

Compare this information with the existing registered tests in the dashboard. Identify missing coverage, prioritizing positive tests for every route (valid requests that exercise the expected successful behavior). Also add relevant negative tests for invalid inputs, validation failures, and expected errors.

For each missing test:

Define the name, HTTP method, endpoint, description, request headers and body when applicable.

Specify the expected HTTP status code and response validation criteria.

Assign an appropriate category, such as success, input validation, or expected error.

Follow the actual implementation and business rules. Do not invent routes, request fields, response structures, or expected behavior. If something cannot be determined from the code, explicitly flag it for review.

Avoid duplicating existing tests. If possible, create the missing test cases in the dashboard's existing format. Otherwise, provide them in a structured format that can be imported or added easily.

Finally, summarize the routes analyzed, existing coverage, missing tests, and any uncertainties. Do not claim tests pass until they have actually been executed against the running API.

[2] All your tests that you added now are with � in everywhere that has some kind of accent, it didn't happen before. Also, all your tests didn't work. Check again if you understood how the tickets flow work. You are trying to promote an user that don't even exist. The same happens for tickets.

[3] Below are all tests that fail. For each one, investigate and analyze why it isn't passing the test. Do not change any code, unless you ask for permission. Explain your decisions.

[4] To fix the group one, I want you to implement not only the promote route, because that wouldn't be enough, but I actually want you to analyze the project strucutre, understand how the files are named, and create an actual way to promote. Respect all data kinds, types and type families. If there is something that could break, don't do it. Instead, ask for permission.

ATENÇÃO ESPECIAL PARA O ITEM 4: apesar de eu ter deixado como backend, esse na verdade está relacionado ao HelpFlow mesmo. Então fica no limbo, e SALVO ENGANO, essa nem foi necessária, pois eu estava usando uma versão errada do helpflow, e depois de mudar, deu certo.
