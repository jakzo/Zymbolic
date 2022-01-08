### Symbolic execution

- Generate data flow graph from AST
  - eg. for program:
    ```ts
    x = "Hello, world!"
    log(x[0..4])
    ```
    the graph would look like:
    ```ts
    x = "Hello, world" -> x[0..4] -> log()
    ```
- Trace requirements starting from side-effects
  - eg. for above graph the requirements are:
    ```ts
    log() [side effect] requires: x[0..4] requires: "Hello"
    ```
    so the final code look like:
    ```ts
    log("Hello");
    ```
- `while` loops might be tricky
  -
