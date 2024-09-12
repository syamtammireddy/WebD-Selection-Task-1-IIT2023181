const api="https://test-data-gules.vercel.app/data.json";
let questions=0;
let completed=0;
let bookmarks=[];

  

async function fetching(searching){
    if (searching.trim() === '') {
        alert('Enter a valid search term');
        return; 
    }
    try{

        const response= await fetch(api);
        const result = await response.json();
    
    if(result.status){
        const matched=[];
        questions=0;
         
        result.data.forEach(obj=>{
            if(obj.title && obj.title.toLowerCase().includes(searching.toLowerCase())){
                matched.push(obj);
            }
        });
    
    const list=document.getElementById('questionsl');
    list.innerHTML='';
    if(matched.length>0){
        matched.forEach(obj=>{
            const newdiv=document.createElement('div');
            newdiv.className='newdivclass';
            newdiv.textContent=obj.title;
            list.appendChild(newdiv);
            const panel=document.createElement('div');
            panel.className='panel';
            
            obj.ques.forEach((q,index)=>{
                 questions++;
            
            const questionlist=document.createElement('div');
            questionlist.innerHTML = `
            <div class="flexing">
              <div class="set">
                <input type="checkbox" id="check-${index}" onclick="marked(${index})" >
                <div><a class="nlink" href="${q.p1_link}" target="_blank">${q.title}</a></div> </div> <div class="set">
                <div><a class="link" href="${q.yt_link}" target="_blank">Watch Video</a></div>
                <div ><button class="btn" onclick="bookmarked('${q.title}','${q.yt_link}','${q.p1__link}')">📑</button></div></div>
            </div>
        `;
        
            questionlist.setAttribute('id',`question-${index}`);
            panel.appendChild(questionlist);
        });
           list.appendChild(panel);
           newdiv.addEventListener('click',function(){
            this.classList.toggle('active');
            const panel=this.nextElementSibling;
            if (panel.classList.contains('open')) {
                panel.classList.remove('open');
                panel.classList.add('close');
              } else {
                panel.classList.remove('close');
                panel.classList.add('open');
              }
            if(panel.style.display ==="block"){
                panel.style.display="none";
            }
            else{
                panel.style.display ="block";
            }
           })
        });
    }else{
        list.innerHTML=`<div>No sections found eith given category</div>`
    }
}progressbar();
}
    
   catch(error){
    console.log('err',error);
}
  
  
}
function marked(index) {
    const chkbox=document.getElementById(`check-${index}`);
    const item=document.getElementById(`question-${index}`);
    if(chkbox.checked){
        item.style.backgroundColor = 'lightgreen';
        item.style.color = 'white';
    completed++;
    }
    else {
        item.style.backgroundColor = '';
        completed--;
        item.style.color = ''
      }
      progressbar();
  }
function handlesearch(){
    const searchbar=document.getElementById('search_bar');
    const query=searchbar.value;
    fetching(query);
}
function handlesearch2(f){
    
    fetching2('',f);
}
function  progressbar(){
   const bar=document.getElementById('progressbar');
   const p=(completed/questions)*100;
   bar.style.width=`${p}%`;
   bar.innerText=`${Math.round(p)}% Completed`;
}
function bookmarked(title,yt_link,p1_link){
    if (!bookmarks.some(q => q.title === title && q.yt_link === yt_link && q.p1_link===p1_link)) {
        bookmarks.push({ title, yt_link,p1_link });
        alert('Question bookmarked!');
      } else {
        alert('This question is already bookmarked.');
      }
}
function bookmarkp(){
    const List = document.getElementById('bookmarklist');
       List.innerHTML = ''; 

  if (bookmarks.length > 0) {
    bookmarks.forEach(q => {
      const bookmarkedItem = document.createElement('li');
      bookmarkedItem.innerHTML = `<a class="nlink" href="${q.p1_link}" target="_blank">${q.title}</a> - <a class="link"href="${q.yt_link}" target="_blank">Watch Video</a>`;
      List.appendChild(bookmarkedItem);
    });
  } else {
    bookmarkedList.innerHTML = '<li>No bookmarks yet.</li>';
  }
}
document.getElementById('search').addEventListener('click',handlesearch);
document.getElementById('bookmarkbtn').addEventListener('click',bookmarkp);
document.getElementById('dk').addEventListener('click',function(){
    var element = document.body;

  element.classList.toggle("dark-mode");
})

window.onload= async function(){
        searching='';
        try {
            const response = await fetch(api);
            const result = await response.json();
    
            if (result.status) {
                const matched = [];
                
    
                result.data.forEach(obj => {
                    if (obj.title && obj.title.toLowerCase().includes(searching.toLowerCase())) {
                        matched.push(obj);
                         
                    }
                });
                const xx=document.getElementsByClassName("dropdown-content")[0];
                matched.forEach(obj => {
                    const p = document.createElement('p');
                    p.innerHTML = obj.title;               
                    xx.appendChild(p);         
                });
                
    
                console.log('Matched Questions:', matched); 
            }
        } catch (error) {
            console.log('Error:', error);
        }
    }
