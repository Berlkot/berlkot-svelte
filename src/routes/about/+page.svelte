<script lang="ts">
	import Head from '$lib/assets/images/head.webp';
	import Instagram from '$lib/assets/icons/instagram.svg';
</script>

<svelte:head>
	<title>About | Berlkot</title>
	<meta name="og:title" content="Some stuff about myself and my website" />
	<meta name="og:description" content="Some stuff about myself and my website" />
	<meta name="author" content="Berlkot" />
</svelte:head>
<div class="content">
	<h1 class="page-title">about</h1>
	<img class="portrait" src={Head} width="500" height="456" alt="Berlian close up portrait" />
	<section>
		<h2>Who</h2>
		<p class="sub">Berlkot | he/him</p>
		<p>
			At least that's how I called in the virtual world. This name is based on combining word
			<strong>"berlian"</strong> as for <strong>"shiny"</strong> and word "cat" written in russian transliteration.
		</p>
		<p>
			I'm also a <strong>CS student</strong> studying how to make machines do *beep-boop*. Made some
			progress in image processing and game dev.
		</p>
		<p>
			<strong>As an artist,</strong> I really like developing an overall style for a project. Have some
			experience working in a team as a background & concept artist.
		</p>
		<p>
			<strong>In free time</strong>, I really like tinkering with stuff (that's why I have linux as
			my main system) and gaming. And I also somehow got myself involved into furry fandom. Now I
			really want to make my own fursuit at some point <span class="accent">:D</span>
		</p>
	</section>
	<section>
		<h2>Website</h2>
		<p>
			This website was built through pain and grind during a session period as a mean to make myself
			more familiar with web development in general. It has its own CMS and other neat stuff, built
			from the ground up.
		</p>
		<p>
			I'm <strong>still working</strong> on some major parts of it. For example, RSS and sitemap are
			still missing. And the projects tab... But I have something sweet planned as a way to test my
			web animation framework. So keep an eye on that <span class="accent">0w0</span>
		</p>
	</section>
	<section>
		<h2>Contact</h2>
		<p>
			Right now, my social media are kinda stalling. But I have plans in the future to return to
			updating them.
		</p>
		<div class="social">
			<ul>
				<li>
					<a href="https://www.instagram.com/berlkot/" target="_blank">
						<img src={Instagram} alt="instagram" />
					</a>
				</li>
			</ul>
		</div>
		<p>
			The fastest method for contacting me is <a
				class="link link-decor"
				href="mailto:contact@berlkot.com">Email</a
			>
		</p>
	</section>
</div>

<style>
	.content {
		width: fit-content;
		margin: auto;
	}
	ul {
		margin: 0;
		padding: 0;
		margin-top: 0.1rem;
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}
	ul li {
		width: 4rem;
	}
	ul li:hover {
		filter: var(--chromatic-aberration);
	}
	.accent {
		color: var(--color-accent);
	}

	.sub {
		font-family: var(--ff-display);
	}
	.portrait {
		float: left;
		width: 260px;
	}
	section {
		max-width: 75ch;
	}
	.social {
		margin-bottom: 1rem;
	}
	h2 {
		margin-bottom: 0.5rem;
	}
	@media (max-width: 500px) {
		.content {
			display: flex;
			flex-direction: column;
		}
	}
</style>
