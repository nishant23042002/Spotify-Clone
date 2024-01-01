
let currentSong = new Audio();
let songBtn = document.querySelector(".song-buttons").querySelectorAll("i")[1];
let songs;
let currFolder;


function convertSecondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) {
      return '00:00';
    }
  
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
  
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
  
    return `${formattedMinutes}:${formattedSeconds}`;
}

  

async function getSongs(folder){
    currFolder = folder;
    let  a = await fetch(`http://192.168.0.105:5500/${folder}/`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let aTag = div.getElementsByTagName("a");
    
    songs = [];
    for (let index = 0; index < aTag.length; index++) {
        const element = aTag[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    let songUl = document.querySelector(".song-lists").getElementsByTagName("ul")[0];
    songUl.innerHTML = "";
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li><i class="fa-solid fa-music"></i>
        <div class="info">
            <div>${song.replaceAll("%20", " ")}</div>
            <div>Spotify</div>
        </div>
        <div class="play-now"> 
                <span>Play</span>
                <div class="circle"><i class="fa-solid fa-play"></i></div>
        </div>
        </li>`;  
    }


    //Attaching eventlistener to each song
    Array.from(document.querySelector(".song-lists").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element=>{
            // console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    });
    return songs;


}

getSongs();


const playMusic = (track)=>{
    // let audio = new Audio("/songs/" + track);
    currentSong.src = `/${currFolder}/` + track;
    if(currentSong.play()){
        currentSong.play();
        songBtn.classList.remove("fa-play")
        songBtn.classList.add("fa-pause")
    }else{
        songBtn.classList.remove("fa-pause")    
        songBtn.classList.remove("fa-play")    
    }
    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums(){
    //Display all albums on the page
    let  a = await fetch(`http://192.168.0.105:5500/songs`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++){
        const e = array[index];
        

        if(e.href.includes("/songs/")){
            let folder = e.href.split("/").slice(-2)[1];
            // console.log(folder)
            //Getting metadata og the folder
            let  a = await fetch(`http://192.168.0.105:5500/songs/${folder}/info.json`);
            let response = await a.json();
            // console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="play">
              <a href="#"
                ><i class="fa-solid fa-play" style="color: #0f0f0f"></i>
              </a>
            </div>
            <img
              src="/songs/${folder}/cover.jpg"
              alt="Sleep"
            />
            <h3>${response.title}</h3>
            <p>${response.description}</p>
          </div>`;
        }
    }

    //Loading playlist album on card click
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item=>{
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        })
    });
}


async function main(){
    let currentSongs;

    await getSongs("songs/ncs");
    // playMusic(songs[0], true);
    // console.log(songs);


    displayAlbums();


    //next previous play     
    play.addEventListener("click", ()=>{
        if(currentSong.paused){
            currentSong.play();
            songBtn.classList.remove("fa-play")
            songBtn.classList.add("fa-pause")
        }else{
            currentSong.pause();
            songBtn.classList.remove("fa-pause")
            songBtn.classList.add("fa-play")
        }
    })


    //listen for time update
    currentSong.addEventListener("timeupdate", ()=>{
        // console.log(currentSong.currentTime, currentSong.duration)
        document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutes(currentSong.currentTime)} / ${convertSecondsToMinutes(currentSong.duration)}`
        document.querySelector(".circle1").style.left = (currentSong.currentTime / currentSong.duration) * 120 + "%";
    });

    //Adding eventlistener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle1").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });


    //Adding an eventlistener for menu bar
    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0";
    })

    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-120%";
    })

    //Adding functionality to previous and next button
    previous.addEventListener("click", ()=>{
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        console.log(songs, index)
        if((index -1) >= 0){
            playMusic(songs[index - 1])
        }

    });
    next.addEventListener("click", ()=>{
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        console.log(songs, index)
        if((index + 1) < songs.length){
            playMusic(songs[index + 1])
        }
    });

    //Adding functionality to volume range
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
        currentSong.volume = parseInt(e.target.value)/100;
    });

    //Adding mute  functionality
    document.querySelector(".volume>img").addEventListener("click", e=>{
        if(e.target.src.includes("volume-up.svg")){
            e.target.src = e.target.src.replace("volume-up.svg","mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }else{
            e.target.src = e.target.src.replace("mute.svg", "volume-up.svg");
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    });

}
main();