//setting variables for http, url, and fs so I can use their respective functions

//http allows us to create the server
const http = require('http'),

//url lets us draw and look at the URL
url = require('url'),

//fs will let us read and edit text files in the directory
fs = require('fs');

http.createServer((request, response)=> {
    //this gives us our URL
    let addr = request.url;

    //this variable is parsing through the URL so it can be understood
    q = url.parse(addr, true);

    //it is currently empty and serves as the location for which our file path will go
    filePath = '';

    //this creates a log.txt file that writes (in itself), the URL and the timestamp whenever the server is ran
    fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err)=>{
        //if we detect an error, such as if log.txt does not exist, this throws the error and stops the rest of the function
        if (err){
            throw err;
        }
        //This just tells us that the log was successful
        else{
            console.log('Added to log');
        }
    });

    //this checks to see if the path name has anything called documentation
    if (q.pathname.includes('documentation')){
        //if there is then the filePath will now be 
        //(whatever the directory name is specified here by __dirname)/documentation.html
        filePath = __dirname + 'documentation.html';
    }

    else {
        //otherwise it is just index.html
        filePath = 'index.html';
    }

    //reads the file located in file Path (whether it is documentation.html or index.html)
    fs.readFile(filePath, (err, data) => {
        //if neither exists, error is thrown and function is stopped
        if (err){
            throw err;
        }

        //if it is able to read one of them, then it is going to write something with the code 200 and that content type
        response.writeHead(200, {
            'Content-Type': 'text/html'
        });
        //afterwards, it writes down the data which was returned by readfile (if it wasn't an error)
        response.write(data);
        //ends the function after
        response.end;
    })
//listen to port 8080, default
}).listen(8080);

//confirms that the server is running
console.log('My test server is running on Port 8080');
