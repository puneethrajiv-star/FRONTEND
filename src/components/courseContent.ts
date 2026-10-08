export type CourseLesson = {
  id: string;
  title: string;
  explanation: string;
  concepts: string[];
  code?: string;
};

export type CourseModule = {
  title: string;
  lessons: CourseLesson[];
};

const lesson = (id: string, title: string, explanation: string, concepts: string[], code?: string): CourseLesson => ({
  id,
  title,
  explanation,
  concepts,
  code,
});

export const courseModules: CourseModule[] = [
  {
    title: "C Fundamentals",
    lessons: [
      lesson("intro", "Introduction to C", "C is a compiled, general-purpose language that gives you precise control over how a program uses memory and hardware.", ["How source code becomes an executable", "The role of the compiler", "The structure of a basic C program"], '#include <stdio.h>\n\nint main(void) {\n  printf("Hello, EduBridge!\\n");\n  return 0;\n}'),
      lesson("variables", "Variables and Data Types", "Variables are named locations in memory. Their data type tells C how much space to reserve and how to interpret the stored value.", ["Declaring and initializing variables", "Core types: int, float, char, and double", "Choosing descriptive names", "Constants and type safety"], '#include <stdio.h>\n\nint main(void) {\n  int year = 1;\n  float score = 92.5f;\n  char grade = \'A\';\n\n  printf("Year %d, Score %.1f, Grade %c\\n", year, score, grade);\n  return 0;\n}'),
      lesson("io", "Input and Output", "Learn how programs communicate with users through formatted input and output.", ["printf format specifiers", "Reading values with scanf", "Input validation"]),
      lesson("operators", "Operators", "Use arithmetic, relational, logical, and assignment operators to build expressions.", ["Arithmetic operators", "Comparison operators", "Logical expressions"]),
    ],
  },
  {
    title: "Control Flow",
    lessons: [
      lesson("if-else", "if / else", "Make decisions by running code only when a condition is true.", ["Boolean conditions", "else-if chains", "Nested decisions"]),
      lesson("switch", "switch", "Choose one branch from several discrete cases.", ["case labels", "break statements", "default behavior"]),
      lesson("for-loops", "for Loops", "Repeat a block of code with a controlled counter.", ["Initialization", "Loop conditions", "Counter updates"]),
      lesson("while-loops", "while / do-while Loops", "Repeat work while a condition remains true.", ["Pre-test loops", "Post-test loops", "Avoiding infinite loops"]),
    ],
  },
  {
    title: "Functions",
    lessons: [
      lesson("functions", "Functions", "Organize programs into reusable, focused units.", ["Function declarations", "Function definitions", "Calling functions"]),
      lesson("parameters", "Parameters and Return Values", "Pass data into functions and return results.", ["Formal parameters", "Return types", "void functions"]),
      lesson("scope", "Scope", "Understand where variables can be accessed.", ["Local scope", "Global scope", "Variable lifetime"]),
      lesson("recursion", "Recursion", "Solve a problem by reducing it to a smaller version of itself.", ["Base cases", "Recursive calls", "Call stack"]),
    ],
  },
  {
    title: "Arrays & Strings",
    lessons: [
      lesson("arrays", "Arrays", "Store multiple values of the same type in contiguous memory.", ["Indexes", "Array initialization", "Traversing arrays"]),
      lesson("2d-arrays", "2D Arrays", "Represent tables and grids with nested arrays.", ["Rows and columns", "Nested loops", "Memory layout"]),
      lesson("strings", "Strings", "Work with character arrays terminated by a null character.", ["Character arrays", "Null terminator", "Reading strings"]),
      lesson("string-functions", "String Functions", "Use the standard library to inspect and transform strings.", ["strlen", "strcpy", "strcmp"]),
    ],
  },
  {
    title: "Pointers",
    lessons: [
      lesson("pointers", "Introduction to Pointers", "Store and work with memory addresses.", ["Address operator", "Dereferencing", "Pointer types"]),
      lesson("pointer-arithmetic", "Pointer Arithmetic", "Move through contiguous memory using pointer operations.", ["Incrementing pointers", "Pointer differences", "Safe bounds"]),
      lesson("pointers-arrays", "Pointers and Arrays", "See how array names and pointers are closely related.", ["Array decay", "Index notation", "Traversing with pointers"]),
      lesson("pointers-functions", "Pointers and Functions", "Pass addresses to let functions update original values.", ["Pass by address", "Output parameters", "Pointer safety"]),
    ],
  },
  {
    title: "Structures & Files",
    lessons: [
      lesson("structures", "Structures", "Group related values of different types.", ["struct definitions", "Member access", "Arrays of structures"]),
      lesson("unions", "Unions", "Share one memory location between several possible representations.", ["Shared storage", "Union members", "Use cases"]),
      lesson("files", "File Handling", "Save and retrieve information using files.", ["Opening and closing files", "Reading and writing", "Error handling"]),
    ],
  },
];

export const flatLessons = courseModules.flatMap((module) =>
  module.lessons.map((item) => ({ ...item, module: module.title })),
);
