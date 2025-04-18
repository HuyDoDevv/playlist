const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'HUY_DO'
var FIRSTBEGINNING = true;

const container = $('.container');
const player = $('.player');
const playlist = $('.playlist');
const cd = $('.cd');
const cdWidth = cd.offsetWidth;
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const searchtText = $('.search-text');
const totalTime = $('.total-time');
const currentTime = $('.current-time');
const actionIcon = $('.action-icon');
const listAction = $('.list-action');
const filterFavourite = $('.filter-favourite');
const filterFavouriteIcon = $('.filter-favourite-icon');

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  isFilterLiked: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: "Mất Kết Nối",
      singer: "Dương Domic",
      path: "./songs/song-1.mp3",
      image: "./images/image-1.jpg",
      heart: false
    },
    {
      name: "Tái Sinh",
      singer: "Tùng Dương",
      path: "./songs/song-2.mp3",
      image: "./images/image-2.jpg",
      heart: false
    },
    {
      name: "E Là Không Thể",
      singer: "Anh Quân",
      path: "./songs/song-3.mp3",
      image: "./images/image-3.jpg",
      heart: false
    },
    {
      name: "Id 072019",
      singer: "W/n",
      path: "./songs/song-4.mp3",
      image: "./images/image-4.jpg",
      heart: false
    },
    {
      name: "Chân Ái",
      singer: "Orange, Khói, Châu Đăng Khoa",
      path: "./songs/song-5.mp3",
      image: "./images/image-5.jpg",
      heart: false
    },
    {
      name: "Hạ Còn Vương Nắng",
      singer: "DatKaa",
      path: "./songs/song-6.mp3",
      image: "./images/image-6.jpg",
      heart: false
    },
    {
      name: "Sự Nghiệp Chướng",
      singer: "Pháo",
      path: "./songs/song-7.mp3",
      image: "./images/image-7.webp",
      heart: false
    },
    {
      name: "Gặp Lại Năm Ta 60",
      singer: "Orange",
      path: "./songs/song-8.mp3",
      image: "./images/image-8.jpeg",
      heart: false
    }
  ],

  // Lưu cấu hình vào localStorage
  setConfig(key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },

  defineProperties() {
    Object.defineProperty(this, 'currentSong', {
      get: () => this.songs[this.currentIndex],
    });
  },
  
  render() {
    const htmls = this.songs
      .filter((song) => (this.isFilterLiked ? song.heart : true))
      .map((song, index) => this.createSongHtml(song, index));

    playlist.innerHTML = htmls.join('');
    this.updateButtons();
  },

  createSongHtml(song, index) {
    return `
      <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index='${index}'>
        <div class="thumb" style="background-image: url(${song.image})"></div>
        <div class="body">
          <h3 class="title">${song.name}</h3>
          <p class="author">${song.singer}</p>
        </div>
        <div class="option">
          <i class="option-icon option-icon-heart ${song.heart ? 'option-icon-heart-active fa-heart fa-solid' : 'fa-regular fa-heart'}"></i>
          <a href="${song.path}" download="${song.name}" class="link-download">
            <i class="option-icon fa-solid fa-download"></i>
          </a>
          <i class="option-icon option-icon-cancel fa-solid fa-xmark"></i>
        </div>
      </div>
    `;
  },

  updateButtons() {
    randomBtn.classList.toggle('active', this.isRandom);
    repeatBtn.classList.toggle('active', this.isRepeat);
    filterFavouriteIcon.classList.toggle('fa-solid', this.isFilterLiked);
    filterFavouriteIcon.classList.toggle('filter-favourite-icon-active', this.isFilterLiked);
  },

  handleEvents: function () {
    const _this = this;

    // Xử lý cd quay và dừng
    const cdThumbAnimate = cdThumb.animate([{ transform: 'rotate(360deg)' }], {
      duration: 10000,
      iterations: Infinity,
    });

    cdThumbAnimate.pause();

    // Xử lý phóng to và thu nhỏ
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const newCdWidth = cdWidth - scrollTop;

      cd.style.width = newCdWidth > 0 ? `${newCdWidth}px` : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    }

    // Xử lý khi click play
    playBtn.onclick = function () {
      _this.isPlaying ? audio.pause() : audio.play();
    }

     // Khi audio chạy
     audio.onplay = function() {
      _this.isPlaying = true;
      player.classList.add('playing')
      cdThumbAnimate.play();
    }

    // Khi audio dừng
    audio.onpause = function() {
      _this.isPlaying = false;
      player.classList.remove('playing')
      cdThumbAnimate.pause();
    }

    // Khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function() {
      if (audio.duration) {
        const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
        const minutes = Math.floor(Math.floor(audio.currentTime) / 60);
        const remainingSeconds = Math.floor(audio.currentTime) % 60;

        currentTime.textContent = _this.formatTime(minutes, remainingSeconds);
        progress.value = progressPercent;
        progress.style.background = `linear-gradient(to right, darkred 0%, darkred ${progressPercent}%, #d3d3d3 ${progressPercent}%, #d3d3d3 100%)`
      }
    }

    audio.onloadedmetadata = function() {
      const duration = audio.duration; 
      const minutes = Math.floor(duration / 60);
      const remainingSeconds = Math.floor(duration % 60);
      totalTime.textContent = _this.formatTime(minutes, remainingSeconds);
    };

    // Xử lý khi tua
    progress.onchange = function(e) {
      const seekTime = audio.duration / 100 * e.target.value;
      audio.currentTime = seekTime;
    }

    // Khi tới bài hát
    nextBtn.onclick = function () {
      _this.isRandom ? _this.playRandomSong() : _this.nextSong();
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    }

    // Khi lui bài hát
    prevBtn.onclick = function () {
      _this.isRandom ? _this.playRandomSong() : _this.prevSong();
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    }

    // Xử lý bật tắt random song
    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom;
      _this.setConfig('isRandom', _this.isRandom);
      randomBtn.classList.toggle('active', _this.isRandom);
    }

    // Xử lý 
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig('isRepeat', _this.isRepeat);
      repeatBtn.classList.toggle('active', _this.isRepeat);
    }

    // Xử lý khi hết bài hát
    audio.onended = function () {
      _this.isRepeat ? audio.play() : nextBtn.click();
    }

    // search playlist
    searchtText.onkeyup = function(e) {
      let debounceTimer;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        _this.filterSongs(e.target.value);
      }, 1000);
    }

    actionIcon.onclick = function() {
      listAction.classList.toggle('hidden');
    }

    filterFavourite.onclick = function() {
      _this.isFilterLiked = !_this.isFilterLiked;
      _this.setConfig('isFilterLiked', _this.isFilterLiked);
      filterFavouriteIcon.classList.toggle('fa-solid', _this.isFilterLiked);
      filterFavouriteIcon.classList.toggle('filter-favourite-icon-active', _this.isFilterLiked);
      const songNodes = $$('.song');
   
      if (_this.isFilterLiked) {
        songNodes.forEach((element,index) => {
          element.style.display = _this.songs[index].heart ? 'flex' : 'none';
        });
      }else{
        _this.render();
      }
      _this.scrollToActiveSong();
    }
    // Lắng nghe playlist
    playlist.onclick = function (e) {
      const songNodeNotActive = e.target.closest('.song:not(.active)');
      const songNode = e.target.closest('.song');
      const optionNode = e.target.closest('.option');

      if (songNodeNotActive && !optionNode) {
        if (songNodeNotActive) {
          _this.currentIndex = Number(songNodeNotActive.dataset.index);
          _this.loadCurrentSong();
          audio.play();
          _this.render();
         }
      }

      if (optionNode) {
        if (e.target.classList.contains('option-icon-heart')) {
          const isLiked = e.target.classList.toggle('fa-solid');
          _this.songs[Number(songNode.dataset.index)].heart = isLiked;
          _this.setConfig('songs', _this.songs);
          e.target.classList.toggle('fa-regular', !isLiked);
          e.target.classList.toggle('option-icon-heart-active', isLiked);
        }
        if (e.target.classList.contains('option-icon-cancel')) {
          let text = "Do you want to remove this song from the playlist!\nEither OK or Cancel.";
          if (confirm(text) == true) {
            songNode.remove();
            _this.songs.splice(songNode.dataset.index,1)
            _this.setConfig('songs', _this.songs);
            if (Number(songNode.dataset.index) == _this.currentIndex) {
              _this.loadCurrentSong();
              audio.play();
              _this.render();
            }
          }
        }
      }
    }
  },
  loadConfig: function() {
    this.isRandom = this.config.isRandom || false;
    this.isRepeat = this.config.isRepeat || false;
    this.isFilterLiked = this.config.isFilterLiked || false;
    this.songs = this.config.songs || this.songs;
  },

  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    container.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
  },

  filterSongs: function(query) {
    const queryUpper = query.toUpperCase();
    const songNodes = $$('.song');
    songNodes.forEach(element => {
      const title = element.querySelector('.title').textContent.toUpperCase();
      const author = element.querySelector('.author').textContent.toUpperCase();
  
      const isMatch = title.includes(queryUpper) || author.includes(queryUpper);
      element.style.display = isMatch || query === '' ? 'flex' : 'none';
    });
  },

  formatTime: function(minutes, remainingSeconds) {
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  },

  nextSong: function() {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },

  prevSong: function() {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },

  playRandomSong: function() {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length)
    } while (newIndex === this.currentIndex) {
      this.currentIndex = newIndex;
      this.loadCurrentSong();
    }
  },

  scrollToActiveSong: function() {
    let defindBlockProprety = this.currentIndex == 0 ? 'end' : 'nearest'
      setTimeout(() => {
        $('.song.active').scrollIntoView({
          behavior: 'smooth',
          block: defindBlockProprety,
        }, 300)
      })
  },

  start: function () {
    // Gán cấu hình config
    this.loadConfig();

    // Định nghĩ các thuộc tính cho object
    this.defineProperties();

    // Lắng nghe và xử lý các sự kiện
    this.handleEvents();

    // Tải thông tin bài hát đầu tiên
    this.loadCurrentSong();

    // Render
    this.render();
  }
};

app.start();