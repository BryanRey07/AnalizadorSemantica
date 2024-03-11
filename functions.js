


const result = document.querySelector(".result");
const gen = document.querySelector("#generated");
const info = document.querySelector("#info");
const outputContainer = document.querySelector("#outputContainer");
const compile = document.querySelector("#compile");
const keyWords = /^(Template|Line|Id|yellow|blue|red|green|black|white)$/g,
      reSingleOperator = /([-+*\/=()&|;:,<>{}[\]])/g,
      reNumbers = /\b\d+(\.\d*)?([eE][+-]?\d+)?\b/g;
let a = 0, j = 0, x1, x2, y1, y2, exit = false;
 
outputContainer.innerHTML=`   <tr>
<td>-</td>
<td>-</td>
</tr>`;

c2 = `Id aa = 1000 Template aa, 200 blue Id a = 300  Line 23 23 a 23 yellow`;
info.value = c2;
 

compile.addEventListener("click", (e)=>{

  e.preventDefault();
  clearFields()
    if(info.value.trim() == 0){
      alert("Empty input");
    }else{
      //Lexical analyzer checker
      const res = lexicalAnalyzer(info.value)
        

      //Missing keywords, Template must always be in
     if(res.filter(item =>{return item.value.match(/^(Template)$/)}).length === 0){
        result.innerHTML = `Unable to trace a line without a template.`;
        exit = true;
        return;
     } 

      //Assuring the max width and height of canvas
      if(res[1].value > 1080 || res[2].value > 400){
        result.innerHTML = `The maximum dimensions for the canvas are 1080 x 400 but received ${res[1].value} x ${res[2].value}`;
        exit = true;
        return;
      }
      //Lexical analyzer checker

      result.innerHTML = "";
      let rows = ``;
        res.forEach((dict) =>{

        //console.log(rows)
            rows += `   <tr>
                          <td class="lightblue">${dict["type"]}</th>
                          <td>${dict["value"]}</td>
                        </tr>`;
        });

      outputContainer.innerHTML=rows;

      //Code formatter
       let formattedCode = "";
        res.forEach((dict) => {
            if(dict["value"].match(/^(Template|Line|Id)$/g,))
              formattedCode+="\n";
            formattedCode+= dict["value"]+" ";
        });
        
        info.value = formattedCode;
        

      gen.innerHTML = codeGenerator(syntaxAnalyzer(lexicalAnalyzer(info.value)));
    }


});


function lexicalAnalyzer (code) {
  return code.replaceAll(",", " ").split(/\s+/)
          .filter(function (t) { return t.length > 0 })
          .map(function (t) {

                if(t.match(keyWords))
                    return {type: "Keyword", value: t};
                else if(t.match(reNumbers))
                    return {type: "Number", value: t};
                else if(t.match(reSingleOperator))
                    return {type: "Operator", value: t};
                else 
                    return {type: "Id", value: t};
          })
}

function syntaxAnalyzer (tokens) {
    let arg;
    let syntaxTree = {
      type: "Line tracing",
      expression: [],
      command: [],
      variable: []
    }

    //Loop Lexical analyzer tokens
    while (tokens.length > 0){
      let currentToken = tokens.shift(); //Shift removes the first item and returns removed
  
        //Look for keywords
    if (currentToken.type === "Keyword") {
            
            switch (currentToken.value) {
            /***************************************************************************/
          case "Template":
                    let expression = {
                    type: "expression",
                    name: "Template",
                    arguments: []
                    }
                    
            const templateArray = ["width", "height", "color"];
            for (let i = 0; i < 3; i++) {

                //Validates next line to be a Line command and if it i = 4 means there was no specified color to which "Black" was assigned as default
                if( (i == 2 && tokens[0] === undefined) || (i == 2 && tokens[0].value === "Line")  || (i == 2 && tokens[0].value === "Id")){
                  arg = {type: "Keyword", value: "white"};
                }else{
                  arg = tokens.shift(); // Loop through token
                }

                 //Too many numeric arguments
                 if(i === 2 && arg.type === "Number"){
                  result.innerHTML = `Too many arguments, expected int, int, string near \"${arg.value}\"`;
                  exit = true;
                  return;
                }
                //Too many keywords | Too many keywords in between args
                if(i < 2 && arg.type === "Keyword"){
                  result.innerHTML = `Incorrect list of arguments, expected int, int, string near \"${arg.value}\"`;
                  exit = true;
                  return;
                  } 

                if(tokens[0] !== undefined)
                  if(i === 2 && tokens[0].value !== "Line" &&tokens[0].value !== "Id"){
                    result.innerHTML = `Too many keywords, expected int, int, string near \"${arg.value}\"`;
                    exit = true;
                    return;
                  }

                  if(arg === undefined){
                    result.innerHTML = "Incorrect list of arguments in Template width (float), height (float), (optional) color (string))";
                      return;
                  }

                if(arg.type === "Number" || i === 2  || arg.type === "Id") {

                            //Validate that the ID exists
                            if(arg.type === "Id"){
                              
                              let v = false;
                                  let runner = syntaxTree.variable;
                                  runner.forEach((subArray) =>{
                                        
                                        if(subArray.arguments[0].value.type === "Id")
                                        if(subArray.arguments[0].value.value === arg.value)
                                            v = true;
                                      
                                  });
                                
                                    if(v === false){
                                    result.innerHTML = `Variable \"${arg.value}\" is not declared`;
                                    exit = true;
                                    return;
                                    }
                            }

                    //Template arguments: Width, Height, #Color
                            expression.arguments.push({  // add argument information to expression object
                            type: templateArray[i],
                            value: arg
                        });



                } else {
                  result.innerHTML = "Incorrect list of arguments in Template width (float), height (float), (optional) color (string))";
                  exit = true;
                    return;
                }
            } 
                syntaxTree.expression.push(expression)    // Add expression to the syntax tree
                break;
            /***************************************************************************/

            case "Line":
                
                    let command = {
                        type: "command",
                        name: "Line",
                        arguments: []
                        }
                        
                const lineArray = ["startX", "startY", "endX", "endY", "color"];

                for (let i = 0; i < 5; i++) {

                  //Validates next line to be a Line command and if it i = 4 means there was no specified color to which "Black" was assigned as default

                  if( (i == 4 && tokens[0] === undefined) || (i == 4 && tokens[0]["value"] === "Line")){
                    arg = {type: "Keyword", value: "black"};
                  }else{
                     arg = tokens.shift(); // Loop through token
                  }

                    //Too many numeric arguments
                    if(i === 4 && arg.type === "Number"){
                      result.innerHTML = `Too many arguments, expected int, int, int, int, string near \"${arg.value}\"`;
                      exit = true;
                      return;
                    }
                    if(arg === undefined){
                      result.innerHTML = "Incorrect list of arguments Line startX (int), startY (int), endX (int), endY (int), (optional) color (string)";
                            return;
                      }
                    //Too many keywords | Too many keywords in between args
                    if(i < 4 && arg.type === "Keyword"){
                      result.innerHTML = `Incorrect list of arguments, expected int, int, int, int, string near \"${arg.value}\"`;
                      exit = true;
                      return;
                      }

                      if(tokens[0] !== undefined)
                    if(i === 4 && tokens[0].value !== "Line"){

                        result.innerHTML = `Too many keywords, expected int, int, int, int, string near \"${arg.value}\"`;
                        exit = true;
                        return;

                      } 

                    if(i === 4 || arg.type === "Number" || arg.type === "Id") {
                        
                          //Validate that the ID exists
                            if(arg.type === "Id"){
                              
                              let v = false;
                                  let runner = syntaxTree.variable;
                                  runner.forEach((subArray) =>{
                                        
                                        if(subArray.arguments[0].value.type === "Id")
                                        if(subArray.arguments[0].value.value === arg.value)
                                            v = true;
                                      
                                  });
                                
                                    if(v === false){
                                    result.innerHTML = `Variable \"${arg.value}\" is not declared`;
                                    exit = true;
                                    return;
                                    }
                            }


                            //Line startX, startY, endX, endY, color 
                                command.arguments.push({  // add argument information to expression object
                                type: lineArray[i],
                                value: arg
                            });
                            
                    } else {
                      result.innerHTML = "Incorrect list of arguments Line startX (int), startY (int), endX (int), endY (int), (optional) color (string)";
                        return;
                    }
                } 
                    syntaxTree.command.push(command)    // Add command to the syntax tree
                
                break;
        
        //Look for Ids, aka variables
            case "Id":
              let variable = {
                  type: "variable",
                  name: "Id",
                  arguments: []
                  }
                  
                const idArr = ["varName", "operator", "value"];
            for (let i = 0; i < 3; i++) {

              arg = tokens.shift(); // Loop through token, varname, operator, value
              //console.log(idArr[i]) 
              //console.log(arg) 
              
              //Validating variable does not exist
              if(i === 0 && syntaxTree.variable[0] !== undefined){

                if(arg.type === "Id"){
                              
                  let v = false;
                      let runner = syntaxTree.variable;
                      runner.forEach((subArray) =>{
                            
                            if(subArray.arguments[0].value.type === "Id")
                            if(subArray.arguments[0].value.value === arg.value)
                                v = true;
                          
                      });
                    
                        if(v === true){
                        result.innerHTML = `Variable \"${arg.value}\" has already been declared`;
                        exit = true;
                        return;
                        }
                }
              }

              //Validating variable name not to be a keyword
              if(i === 0 && arg.type === "Keyword"){
                result.innerHTML = `Variable name cannot be a reserved keyword near \"${arg.value}\"`;
                exit = true;
                return;
              }

              //Missing assigment operator =
              if(i === 1 && arg.value != "="){
                result.innerHTML = `Missing assignment operator near \"${arg.value}\"`;
                exit = true;
                return;
              }
              
              if(i === 2){
                  if(isNaN(arg.value)){//Is string
                    clearFields();
                    result.innerHTML = `The assigment value \"${arg.value}\" is not a valid integer`;
                    return "Syntax error";
                }
              }

              //Missing assigment value
              if((i === 2 && arg.type !== "Number" && arg.type === "Keyword")){
                result.innerHTML = `Missing value to be assigned to variable near \"${arg.value}\"`;
                exit = true;
                return;
              }

              //Validate too many assigment values
              if(tokens.length > 0){
                  if(i === 2 && tokens[0].value !== "Template" && tokens[0].value !== "Line" && tokens[0].value !== "Id"){
                    result.innerHTML = `Too many assignment values near \"${arg.value}\"`;
                    exit = true;
                    return;
                }
              }

                  variable.arguments.push({  // add argument information to variable object
                    type: idArr[i],
                    value: arg
                  });

            }   
                syntaxTree.variable.push(variable)    // Add command to the syntax tree
          break;
        
        }

    }

      }
        return syntaxTree
}

function codeGenerator (syntaxTree) {

  if(exit == true){
    exit = false;
    return "Syntax error";
  }
  //Look for variables
  let varTree = {}, lineNum = 0;
  while(syntaxTree.variable.length > 0){
    let variable = syntaxTree.variable.shift()["arguments"];
    let varName = variable[0].value.value;
    let varValue = variable[2].value.value;
    varTree[varName] = varValue;
  }

  /**CHECKING FOR EXPRESSIONS VARIABLES */
  //Switched used variables for their values
  //Deal with expressions
    //Verify if it's not a number, then check variables
    for (let i = 0; i < 2; i++) {

      if(isNaN(syntaxTree.expression[0]["arguments"][i].value.value)){ //Is string

        const desiredValue = syntaxTree.expression[0]["arguments"][i].value.value;

      if(desiredValue in varTree){
          //Extract used variables and switch to proper value
          syntaxTree.expression[0]["arguments"][i].value.value = varTree[desiredValue];
        }else{
        result.innerHTML = `The variable ${desiredValue} has not been declared`;
        clearFields();
        return "Syntax error";
      }

    }

    }

    const w = syntaxTree.expression[0]["arguments"][0].value.value;
    const h = syntaxTree.expression[0]["arguments"][1].value.value;
   //Assuring the max width and height of canvas
   if(w > 1080 || h > 400){
    result.innerHTML = `The maximum dimensions for the canvas are 1080 x 400 but received ${w} x ${h}`;
    return "Syntax error";
  }
  /**CHECKING FOR EXPRESSIONS VARIABLES */

  let generatedCode = "";
  //Create canvas out of the expression object
    const template = document.createElement("canvas");
          template.id = "canvas";
          template.width = syntaxTree.expression[0]["arguments"][0].value.value;
          template.height = syntaxTree.expression[0]["arguments"][1].value.value;
          template.style.backgroundColor = syntaxTree.expression[0]["arguments"][2].value.value;

        generatedCode += template.outerHTML + "\n";
        result.appendChild(template);
      //Draw lines out of the command object **

          let canvas = document.querySelector("#canvas");
          let canvasContext = canvas.getContext("2d");

          generatedCode += `\nlet canvas = document.querySelector("#canvas");\nlet canvasContext = canvas.getContext("2d");\nlet v0 = "", v1 = "", v2 = "", v3 = ""; \n`;
            
          while(syntaxTree.command.length > 0){
              //Increase line number to print
                lineNum++;

            let command = syntaxTree.command.shift();
                command = command["arguments"];

            //VALIDATE THE USE OF VARIABLES FOR THE LINES
              //varTree 
              const tempCommVars = [];
              for (let i = 0; i < 4; i++) {

                if(isNaN(command[i].value.value)){ //Is string

                  const desiredValue = command[i].value.value;
                if(desiredValue in varTree){

                    tempCommVars.push({varName: desiredValue, varValue: varTree[desiredValue], id: i});
                    command[i].value.value = varTree[desiredValue];

                }
                else{
                  result.innerHTML = `The variable ${desiredValue} has not been declared`;
                  clearFields();
                  return "Syntax error";
                }
                
              }else{ //Is numeric
                  //push int value into var array
              tempCommVars.push({varName: "Nvar", varValue: command[i].value.value, id: i});

            }

            }
            //VALIDATE THE USE OF VARIABLES FOR THE LINES
          

            //Variable generation
            for (let i = 0; i < tempCommVars.length; i++) 
               eval("v"+ tempCommVars[i].id +" = "+tempCommVars[i].varValue);

            //Include variables declaration
            generatedCode += `\n//This is line # ${lineNum}\nv0 = ${v0}, v1 = ${v1}, v2 = ${v2}, v3 = ${v3};\n\n`;

            //Validating for missing color parameter
              if(command[4].value === undefined) 
                  command[4]["value"] = {type: "color", value: "black"};

            let color = command[4].value.value;
  
            canvasContext.beginPath();
            canvasContext.moveTo(v0, v1);
            canvasContext.lineTo(v2, v3);
            canvasContext.strokeStyle = color;
            canvasContext.stroke();

            generatedCode += `canvasContext.beginPath();\ncanvasContext.moveTo(v0, v1);\ncanvasContext.lineTo(v2, v3);\ncanvasContext.strokeStyle = "${color}";\ncanvasContext.stroke(); \n`;

            }
   
   return generatedCode;
  }


//Determining coordinates to draw on
const coordsContainer = document.querySelector(".coords");
const marker = document.querySelector(".marker");
document.body.addEventListener("click", (e)=>{

    e.preventDefault();
    if(e.target.id === "canvas"){
      let rect = e.target.getBoundingClientRect();
      let x = Math.floor(e.clientX - rect.left), y = Math.floor(e.clientY - rect.top);
      coordsContainer.innerHTML = `lastX: ${x}, lastY: ${y} `;

      if(a == 0){
        x1 = x;
        y1 = y;
        a++;
        return;
      }

      if(a == 1){
        x2 = x;
        y2 = y;
        a++;
        info.value += `\nLine ${x1}, ${y1}, ${x2}, ${y2}`;
        a = 0;
      }
 



    }



    if(e.target.id === "res"){

        let rect = e.target.getBoundingClientRect();
        let x = Math.floor(e.clientX - rect.left), y = Math.floor(e.clientY - rect.top);
        coordsContainer.innerHTML = `lastX: ${x}, lastY: ${y} `;

        /************************************ */
        let dot = document.createElement("div");

        dot.classList.add("dot");
        dot.style.left = (x+11)+"px";
        dot.style.top = (y+53)+"px";
        result.appendChild(dot);

        setTimeout(() => {
          result.removeChild(dot);
        }, 100);
        /************************************ */
        //getX ANCHO
        if(a == 0){
          x1 = x;
          a++;
          return;
        }
        //getX
        if(a == 1){
          x2 = x;
          a++;
          return;
        }
        //getY LARGO
        if(j == 0){
          y1 = y;
          j++;
          return;
        }

        if(j == 1){
          y2 = y;
        }

          realX = x1-x2;
          realY = y1-y2;

          if(realX < 0)
              realX *= -1;

          if(realY < 0)
              realY *= -1;

          info.value = `\nTemplate ${realX}, ${realY}`;
          a = 0;
          j = 0;

    }
  });
  

//Hover canvas
document.body.addEventListener("mousemove", (e)=>{

    e.preventDefault();
    if(e.target.id === "canvas"){
      let rect = e.target.getBoundingClientRect();
      let x = Math.floor(e.clientX - rect.left), y = Math.floor(e.clientY - rect.top);
        document.querySelector(".coords2").innerHTML = `canvX: ${x}, canvY: ${y}`;
    }

});

function clearFields(){
  gen.innerHTML = "";
  outputContainer.innerHTML=`   <tr>
                          <td>-</td>
                          <td>-</td>
                          </tr>`;
  result.innerHTML = "";
    
}