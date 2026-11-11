// ClassLink server: zero dependencies. Run: node server.js
const http=require('http'),fs=require('fs'),path=require('path');
const FILE=path.join(__dirname,'data.json'),PORT=process.env.PORT||3000;
let state=null;try{state=JSON.parse(fs.readFileSync(FILE,'utf8'))}catch(e){}
const clients=new Set();
http.createServer((req,res)=>{
  if(req.url==='/api/events'){
    res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache',Connection:'keep-alive'});
    res.write('retry: 2000\n\n');clients.add(res);req.on('close',()=>clients.delete(res));return;
  }
  if(req.url==='/api/state'){
    if(req.method==='POST'){
      let b='';
      req.on('data',c=>{b+=c;if(b.length>5e6)req.destroy()});
      req.on('end',()=>{
        try{
          state=JSON.parse(b);
          const out=JSON.stringify(state);
          fs.writeFile(FILE,out,()=>{});
          clients.forEach(c=>c.write('data: '+out+'\n\n'));
          res.end('ok');
        }catch(e){res.statusCode=400;res.end('bad json')}
      });
      return;
    }
    res.setHeader('Content-Type','application/json');return res.end(JSON.stringify(state));
  }
  fs.readFile(path.join(__dirname,'public','index.html'),(e,d)=>{
    if(e){res.statusCode=500;return res.end('Missing public/index.html')}
    res.setHeader('Content-Type','text/html; charset=utf-8');res.end(d);
  });
}).listen(PORT,()=>console.log('ClassLink running on http://localhost:'+PORT));
