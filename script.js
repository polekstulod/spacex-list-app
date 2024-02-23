const postsContainer = document.getElementById("posts-container");
const loading = document.querySelector(".lds-roller");
const filter = document.getElementById("filter");

let limit = 5;
let offset = 0;
let allDataLoaded = false;

// Fetch posts from API
async function getPosts() {
  const res = await fetch(
    `https://api.spacexdata.com/v3/launches?limit=${limit}&offset=${offset}`
  );

  const data = await res.json();

  // If the number of posts returned is less than the limit, set allDataLoaded to true
  if (data.length < limit) {
    allDataLoaded = true;
    // Add a check to prevent the "No more launches to show" message from being added multiple times
    if (!document.querySelector(".end-of-data")) {
      const endOfDataEl = document.createElement("div");
      endOfDataEl.classList.add("end-of-data");
      endOfDataEl.textContent = "No more launches to show.";
      postsContainer.appendChild(endOfDataEl);
    }
  }

  return data;
}

// Show post in DOM
async function showPosts() {
  const posts = await getPosts();

  posts.forEach((post) => {
    const postEl = document.createElement("div");
    const launchYear = new Date(post.launch_date_utc).getFullYear();
    postEl.classList.add("post");
    postEl.innerHTML = `
      <div class="post-image"><img src="${
        post.links.mission_patch_small
      }" alt="launch" /></div>
      <div class="post-info">
        <h4 class="post-title">${post.flight_number}: ${
      post.mission_name
    } (${launchYear})</h4>
        <p class="post-body">
        Details: ${post.details || "No details available"}
        </p>
      </div>`;

    postsContainer.appendChild(postEl);
  });
}

// Show loader & fetch more posts
function showLoading() {
  if (allDataLoaded) {
    loading.classList.remove("show");
    return;
  }

  loading.classList.add("show");

  setTimeout(() => {
    loading.classList.remove("show");

    setTimeout(() => {
      offset += 5;

      showPosts();
    }, 300);
  }, 1000);
}

// Filter posts by input
function filterPosts(e) {
  const term = e.target.value.toUpperCase();
  const posts = document.querySelectorAll(".post");

  posts.forEach((post) => {
    const title = post.querySelector(".post-title").innerText.toUpperCase();
    const body = post.querySelector(".post-body").innerText.toUpperCase();

    if (title.indexOf(term) > -1 || body.indexOf(term) > -1) {
      post.style.display = "flex";
    } else {
      post.style.display = "none";
    }
  });
}

// Show initial posts
showPosts();

window.addEventListener("scroll", () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  if (scrollHeight - scrollTop === clientHeight && !allDataLoaded) {
    showLoading();
  }
});

filter.addEventListener("input", filterPosts);
