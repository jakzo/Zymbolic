# @preprocessor typescript

main -> line ("\n" line):+
line -> statement:? _ comment:?

comment -> "#" [^\n]:+

_ -> space:*
__ -> space:+
space -> [ \t]

statement -> command (__ arg):*
command -> [a-zA-Z]:+

arg -> arg_int | arg_ref
arg_int -> [0-9]:+
arg_ref -> "[" arg_int "]"
