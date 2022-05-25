showDetails();


function showDetails() {
    let details = new URL(window.location.href);
    document.querySelector('#app-name').innerHTML = details.searchParams.get("type") + details.searchParams.get("threshold");
    document.querySelector('.text').innerHTML = details.searchParams.get("text");
    if (details.searchParams.get("type") === "environment") {
        document.getElementById('meter').classList.add("circle-earth" + details.searchParams.get("threshold"));
    }
    if (details.searchParams.get("type") === "comfort") {
        document.getElementById('meter').classList.add("circle-comfort" + details.searchParams.get("threshold"));
    }
    
}