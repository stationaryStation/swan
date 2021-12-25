<script lang="ts">
    import './css/nav.css'
    import '../styles/main.css'
    import {links} from "svelte-routing";
    import { HomeIcon, SearchIcon, CalendarIcon, UserIcon, PlusCircleIcon } from 'svelte-feather-icons'
</script>

<div use:links>
    <nav class="navbar">
        <ul class="navbar-nav">
            <li class="navbar-item"><h3 class="navbar-header navbar-title title">Swan</h3></li>
            <li class="navbar-item"><a href="/" class="nav-link"><HomeIcon class="nav-icons" size=30px/></a></li>
            <li class="navbar-item"><a href="/profile" class="nav-link"><UserIcon class="nav-icons" size=30px/></a></li>
    </nav>
</div>