<script lang="ts">
    import './css/nav.css'
    import '../styles/main.css'
    import { HomeIcon, SearchIcon, CalendarIcon, UserIcon, PlusCircleIcon } from 'svelte-feather-icons'
</script>

    <nav class="navbar">
        <ul class="navbar-nav">
            <li class="navbar-item"><h3 class="navbar-header navbar-title title">Swan</h3></li>
            <li class="navbar-item"><a href="#" class="nav-link"><HomeIcon class="nav-icons" size=30px/></a></li>
            <li class="navbar-item"><a href="#" class="nav-link"><CalendarIcon class="nav-icons" size=30px/></a></li>
            <li class="navbar-item"><a href="#" class="nav-link"><UserIcon class="nav-icons" size=30px/></a></li>
            <li class="nav-bottom"><a href="#" class="nav-link"><PlusCircleIcon class="nav-icons-succes nav-icons" size=30px/></a></li>
        </ul>
    </nav>