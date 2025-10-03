async function loadHomeData(){
  try{
    const res=await fetch('content/home.json',{cache:'no-store'});
    if(!res.ok) throw new Error('Falha ao carregar conteúdo');
    const data=await res.json();

    // Carousel
    const indicators=document.querySelector('#newsCarousel .carousel-indicators');
    const inner=document.querySelector('#newsCarousel .carousel-inner');
    if(indicators && inner){
      indicators.innerHTML=''; inner.innerHTML='';
      (data.carousel||[]).forEach((item,idx)=>{
        let internal='#';
        try{
          const found=(data.noticias||[]).find(n => (n.title||'').trim().toLowerCase() === (item.title||'').trim().toLowerCase());
          if(found){ internal=`post.html?slug=${encodeURIComponent(found.slug || (found.title||'').toLowerCase().replace(/\s+/g,'-'))}`; }
        }catch(e){}
        const linkUrl=(item.link && /^https?:\/\//i.test(item.link)) ? item.link : internal;

        const btn=document.createElement('button');
        btn.type='button'; btn.dataset.bsTarget='#newsCarousel'; btn.dataset.bsSlideTo=String(idx);
        btn.ariaLabel='Slide '+(idx+1); if(idx===0){btn.classList.add('active'); btn.ariaCurrent='true';}
        indicators.appendChild(btn);

        const slide=document.createElement('div'); slide.className='carousel-item'+(idx===0?' active':'');
        slide.innerHTML=`<img src="${item.img}" class="d-block w-100" alt="${item.title}">
          <div class="carousel-caption ${idx===0?'text-start':''} bg-frost p-3 rounded-3">
            <h5>${item.title||''}</h5><p>${item.desc||''}</p>
            ${linkUrl && linkUrl !== '#' ? `<a class="btn btn-primary btn-sm" href="${linkUrl}">Ler matéria</a>`:''}
          </div>`;
        inner.appendChild(slide);
      });
    }

    // Notícias
    const newsRow=document.querySelector('#ultimas .row'); if(newsRow){ newsRow.innerHTML=''; }
    (data.noticias||[]).forEach(n=>{
      const internal=`post.html?slug=${encodeURIComponent(n.slug || (n.title||'').toLowerCase().replace(/\s+/g,'-'))}`;
      const linkUrl=(n.link && /^https?:\/\//i.test(n.link)) ? n.link : internal;
      const col=document.createElement('div'); col.className='col-md-4';
      col.innerHTML=`<a class="card h-100 shadow-sm news-card text-start" href="${linkUrl}">
          <img class="card-img-top ratio-16x9 object-cover" src="${n.img||''}" alt="${n.title||''}">
          <div class="card-body"><h3 class="h6 card-title">${n.title||''}</h3>
          <p class="card-text small text-muted">${n.desc||''}</p></div></a>`;
      newsRow.appendChild(col);
    });

    // Patrocinadores
    const sponsorRow=document.querySelector('#patrocinadores .row'); if(sponsorRow){ sponsorRow.innerHTML=''; }
    (data.patrocinadores||[]).forEach(p=>{
      const col=document.createElement('div'); col.className='col-6 col-md-4 col-lg-2';
      col.innerHTML=`<button class="card sponsor-card h-100 text-center shadow-sm sponsor-trigger"
          data-name="${p.name||'Patrocinador'}" data-desc="${p.desc||''}" data-site="${p.link||'#'}">
          <img src="${p.logo||''}" class="card-img-top p-3" alt="${p.name||'Patrocinador'}" loading="lazy">
          <div class="card-body py-2"><p class="card-text small fw-semibold m-0">${p.name||''}</p>
          <span class="small text-muted">Saiba mais</span></div></button>`;
      sponsorRow.appendChild(col);
    });

    const sponsorModalEl=document.getElementById('sponsorModal');
    if(sponsorModalEl){
      const modal=new bootstrap.Modal(sponsorModalEl);
      document.querySelectorAll('.sponsor-trigger').forEach(btn=>{
        btn.addEventListener('click',()=>{
          document.getElementById('sponsorModalLabel').textContent=btn.getAttribute('data-name')||'Patrocinador';
          document.getElementById('sponsorDesc').textContent=btn.getAttribute('data-desc')||'';
          const a=document.getElementById('sponsorLink'); a.href=btn.getAttribute('data-site')||'#';
          modal.show();
        });
      });
    }

  }catch(e){console.error(e);}
}

// Gallery rendering + lightbox
async function loadGallery(){
  try{
    const res=await fetch('content/home.json',{cache:'no-store'});
    const data=await res.json();
    const grid=document.getElementById('gallery-grid'); if(!grid) return;
    grid.innerHTML='';
    const items=Array.isArray(data.galeria)?data.galeria:[];
    items.forEach((g,idx)=>{
      const col=document.createElement('div'); col.className='col-6 col-md-4 col-lg-3';
      col.innerHTML=`<a href="#" class="gallery-thumb d-block" data-idx="${idx}">
        <img src="${g.img||''}" alt="${g.title||''}" loading="lazy">
        <div class="gallery-caption">${g.title||''}</div>
      </a>`;
      grid.appendChild(col);
    });

    const modalEl=document.getElementById('galleryModal'); if(!modalEl) return;
    const modal=new bootstrap.Modal(modalEl);
    const imgEl=document.getElementById('galleryModalImg');
    const capEl=document.getElementById('galleryModalCaption');
    const prevBtn=document.getElementById('galleryPrev');
    const nextBtn=document.getElementById('galleryNext');
    let current=0;

    function openAt(i){
      current=(i+items.length)%items.length;
      const it=items[current]||{};
      if(imgEl) imgEl.src=it.img||'';
      if(capEl) capEl.textContent=it.caption||it.title||'';
      modal.show();
    }
    document.querySelectorAll('.gallery-thumb').forEach(a=>{
      a.addEventListener('click',e=>{e.preventDefault(); const i=parseInt(a.getAttribute('data-idx')||'0',10); openAt(i);});
    });
    if(prevBtn) prevBtn.addEventListener('click',()=>openAt(current-1));
    if(nextBtn) nextBtn.addEventListener('click',()=>openAt(current+1));
  }catch(e){console.error(e);}
}

document.addEventListener('DOMContentLoaded', async ()=>{
  await loadHomeData();
  await loadGallery();
});