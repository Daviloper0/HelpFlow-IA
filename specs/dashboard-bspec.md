# Definição do backend do dashboard
As i'm using claude code now, I don't want to burn all tokens at once, so I will switch my language to english

The following text is mainly written by chatgpt, with minor adjustments by me.

I want you to analyze the existing React codebase and develop a backend that integrates it with a test management and execution system for the HelpFlow API

Do not start modifying files immediately. First, analyze the project, explain your findings, and propose an architecture that fits the existing code. Then implement the solution in verifiable stages.

1. Project Context

HelpFlow is a help desk API developed in Haskell. The React dashboard will be a local tool to simplify development, testing, and troubleshooting of this API.

We also want to improve API documentation and, in the future, investigate generating OpenAPI documentation from the available endpoint and test information.

The React frontend has already been implemented. Your first task is to understand the existing code, identify all buttons that should make an API call.

2. Our Intended Workflow

The planned workflow is as follows:

Manage test cases: Users can view registered tests, create new tests, edit their configurations, and delete test cases.

Run tests: Users can execute an individual test or run the entire test suite.

Test the HelpFlow API: Tests send real HTTP requests to the locally running HelpFlow API and verify endpoint behavior.

Validate results: Each execution compares the actual outcome with the expected outcome, including the HTTP status code and configured response validation criteria.

Store execution history: The system saves execution results so users can identify passed tests, failed tests, and execution timestamps.

Investigate failures: When a test fails, the system gathers relevant information, such as the test configuration, request sent, expected result, actual response, and identified errors. After that, the system should generate a standarized prompt for claude, so that the user can try to fix the problem by modifying the code.

Verify fixes: After modifying the HelpFlow code, users run the tests again to verify that the issue has been resolved and that other functionality still works.

The goal is to create a verifiable development cycle: execute, observe, investigate, fix, and test again.

Important: Do not implement an integration with Claude or any other model without explicit authorization.

3. Expected Functionality

Test case management

Based on the existing frontend and the actual requirements, each test case should support the following fields where appropriate:

1. Unique identifier, such as GET-TICKETS or POST-TICKET.

2. Name
3. HTTP method.
4. Description.
5. Route or endpoint.
6. Request body, when applicable.
7. Expected HTTP status code.
8. Response validation criteria.
9. Test category, such as success, input validation, or expected error.

The backend must support listing, retrieving, creating, updating, and deleting test cases.

Evaluate how the data should be represented in the database and how incoming fields should be validated. Do not introduce requirements that conflict with the existing frontend or API.

## Test execution
The backend system should support:

1. Running a single test case.
2. Running all registered test cases.
3. Comparing actual results against expected results.
4. Recording the outcome of each test.
5. Recording execution timestamps and durations.
6. Viewing execution history.
7. Identifying failures and providing useful details for troubleshooting.  
8. A test must not be considered successful merely because its HTTP request completed. Passing or failing must depend on the validation rules configured for that test.
9. Do not simulate execution results or invent test data to populate the dashboard. If no executions have occurred, the interface must represent that state accurately.

Dashboard overview

The system must support the following operations:

1. Total number of registered tests.
2. Date and time of the most recent execution.
3. Number of passed tests.
4. Number of failed tests.

Before implementing these indicators, define their meaning clearly. For example, distinguish the number of tests passed in the most recent run from the historical number of passed tests. Choose a definition consistent with the existing interface and document it.

4. Architecture and Technologies

First, inspect the project files and identify which technologies, dependencies, and configurations are already present.

As a starting point, consider:

* Frontend: Existing React application.

* Backend: Node.js with Express and TypeScript, if compatible with the current project.

* Persistence: SQLite for storing test cases and execution history locally.

* System under test: HelpFlow, running locally on its own Haskell server.

* Test execution: A controlled component responsible for executing test cases against the API.

Important: Do not treat these choices as final until you have analyzed the repository. If there is a concrete technical reason to choose a different approach, explain it before proceeding.

Keep the frontend and backend organized with clearly separated responsibilities. Do not put all persistence, execution, and validation logic into a single file.

Do not rewrite the HelpFlow Haskell backend in Node.js. The new backend belongs to the dashboard and is responsible for managing and executing tests against HelpFlow.

5. Security and Reliability

Because the system will send HTTP requests and execute tests, establish clear boundaries:

* Do not allow users to execute arbitrary operating system commands through test fields.

* Do not implement a generic shell-command executor.

* Validate HTTP methods, URLs, routes, request bodies, and response validation criteria.

* Prevent tests from accessing arbitrary external services or internal addresses without an explicit policy.

* Initially restrict test execution to the authorized local HelpFlow instance.

* Handle timeouts, connection failures, invalid responses, and unexpected errors.

* Ensure that one failed test does not stop the entire test suite unless there is an explicit reason to do so.

* Avoid unnecessarily logging passwords, tokens, or other sensitive data.

* Prevent concurrent executions from corrupting the history or dashboard metrics.

If compiling or testing the Haskell project requires running commands, explain how that process will work. Do not assume that the Node.js backend has unrestricted access to the Haskell development environment.

6. Integration with the Existing React Frontend

* Preserve as much of the existing frontend as possible. Only modify the bare minimum to contact the backend.

Before implementing the backend endpoints, determine:

What data the existing components expect.

Which buttons and forms require persistence.

Which operations currently rely on static or mock data.

Which loading, success, and error states already exist.

How the components can be connected to the backend with minimal changes.

Then define the dashboard API contracts, including HTTP methods, routes, request and response formats, and error status codes.

Replace mock data with real data only when the corresponding functionality has been implemented. Do not remove existing visual functionality without explaining why.

IMPORTANT: You are not implementing a backend for the HelpFlow, but instead, for the dashboard that tests HelpFlow's API.

7. Documentation and Future Improvements

Organize the implementation so the project can evolve over time.

We want to leave a clear path for:

1. Improving documentation for HelpFlow endpoints.
2. Investigating OpenAPI documentation generation.
3. Exporting test reports and failure details for manual AI analysis.
4. Adding new response validation rules.
5. Viewing execution history and comparing runs.

All of those below should be memorized, as well as all other information tagged with important:

IMPORTANT: Not all these features need to be implemented now. Clearly distinguish first-version requirements from future possibilities.

Avoid unnecessary dependencies, services, and integrations.

Do not invent HelpFlow modules, functions, routes, or types.

Do not replace existing functionality with simplified versions without explaining why.

Do not introduce fake results to make the dashboard appear functional.

Do not implement paid AI API calls.

Do not rewrite the entire project unnecessarily.

Do not make destructive changes before understanding the code.

Do not hide limitations or claim tests passed without actually running them.

Prioritize an implementation that is simple, functional, understandable, and maintainable.
