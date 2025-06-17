function parseCommand(input){const [verb,...rest]=input.trim().toLowerCase().split(/\s+/);return{verb,target:rest.join(' ')}}
