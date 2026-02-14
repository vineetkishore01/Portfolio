(function () {
    'use strict';
    var terminalInput = document.getElementById('terminal-input');
    var terminalBody = document.getElementById('terminal-body');
    var inputLine = document.getElementById('terminal-input-line');
    var terminalContainer = document.getElementById('terminal-container');

    if (!terminalInput || !terminalBody || !inputLine) {
        console.error('Terminal: missing DOM elements');
        return;
    }

    var history = [];
    var historyIndex = -1;
    var startTime = Date.now();

    function focusInput() {
        try { terminalInput.focus({ preventScroll: true }); } catch (e) { terminalInput.focus(); }
    }

    if (terminalContainer) {
        terminalContainer.addEventListener('click', function () { focusInput(); });
        terminalContainer.addEventListener('touchstart', function () { focusInput(); });
    }
    if (terminalBody) {
        terminalBody.addEventListener('click', function () { focusInput(); });
        terminalBody.addEventListener('touchstart', function () { focusInput(); });
    }

    function c(text, color) { return '<span style="color:' + color + '">' + text + '</span>'; }
    function bold(text) { return '<span style="font-weight:700">' + text + '</span>'; }

    var allCmdNames = ['help', 'about', 'whoami', 'skills', 'experience', 'education', 'projects', 'contact',
        'resume', 'certifications', 'neofetch', 'uptime', 'date', 'ls', 'cat', 'ping', 'whois', 'weather',
        'theme', 'clear', 'history', 'eastereggs', 'matrix', 'sudo', 'hack', 'rickroll', 'cowsay', '?'];

    var commands = {
        help: function () {
            return [
                '',
                c('  COMMAND CENTER \u2014 Available Commands', '#60a5fa'),
                c('  \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550', '#334155'),
                '',
                '  ' + c('about', '#4ade80') + '          Who am I \u2014 the full story',
                '  ' + c('whoami', '#4ade80') + '         Quick identity summary',
                '  ' + c('skills', '#4ade80') + '         Technical skill matrix',
                '  ' + c('experience', '#4ade80') + '     Career timeline',
                '  ' + c('education', '#4ade80') + '      Academic background & honors',
                '  ' + c('projects', '#4ade80') + '       Project portfolio',
                '  ' + c('contact', '#4ade80') + '        How to reach me',
                '  ' + c('certifications', '#4ade80') + ' Professional certifications',
                '',
                '  ' + c('neofetch', '#f59e0b') + '       System info (hacker style)',
                '  ' + c('uptime', '#f59e0b') + '         Session uptime',
                '  ' + c('date', '#f59e0b') + '           Current date & time',
                '  ' + c('ls', '#f59e0b') + '             List site sections',
                '  ' + c('cat [file]', '#f59e0b') + '     Read a section',
                '  ' + c('ping', '#f59e0b') + '           Test connection',
                '  ' + c('weather', '#f59e0b') + '        Current mood forecast',
                '  ' + c('theme', '#f59e0b') + '          Toggle terminal theme',
                '  ' + c('history', '#f59e0b') + '        Command history',
                '',
                '  ' + c('goto [section]', '#a78bfa') + ' Navigate to a section',
                '  ' + c('resume', '#a78bfa') + '         Download my resume',
                '  ' + c('clear', '#a78bfa') + '          Clear terminal',
                '  ' + c('eastereggs', '#a78bfa') + '     Find hidden secrets',
                '',
                c('  TIP: Use \u2191/\u2193 for history, Tab for autocomplete', '#64748b'),
                ''
            ];
        },
        about: function () {
            return [
                '',
                c('  \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557', '#3b82f6'),
                c('  \u2551', '#3b82f6') + bold('  VINEET KISHORE                   ') + c('\u2551', '#3b82f6'),
                c('  \u2551', '#3b82f6') + '  Infrastructure Engineer            ' + c('\u2551', '#3b82f6'),
                c('  \u2551', '#3b82f6') + '  Strategic Technologist              ' + c('\u2551', '#3b82f6'),
                c('  \u2551', '#3b82f6') + '  Competitive Intelligence Expert    ' + c('\u2551', '#3b82f6'),
                c('  \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d', '#3b82f6'),
                '',
                '  I architect resilient systems that power critical',
                '  business operations at scale. From managing',
                '  ' + c('Hadoop clusters at HSBC', '#60a5fa') + ' ensuring',
                '  ' + c('99.9% uptime', '#4ade80') + ' for banking systems, to building',
                '  consumer tools like ' + c('Droppy', '#60a5fa') + ' with ' + c('5,000+', '#4ade80') + ' users.',
                '',
                '  ' + c('Location:', '#94a3b8') + ' Singapore / India',
                '  ' + c('Focus:', '#94a3b8') + '    Infrastructure, Data, & AI',
                '  ' + c('Passion:', '#94a3b8') + '  Automation & Competitive Excellence',
                ''
            ];
        },
        whoami: function () {
            return [
                c('  vineet', '#4ade80') + '@' + c('command-center', '#60a5fa') + ' \u2014 Infrastructure Engineer',
                '  Building resilient systems with 99.9% uptime.',
                '  ' + c('uid=1000(vineet) gid=1000(engineers) groups=27(sudo)', '#64748b')
            ];
        },
        skills: function () {
            return [
                '',
                c('  Technical Skill Matrix', '#60a5fa'),
                c('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500', '#334155'),
                '',
                '  ' + c('Infrastructure', '#f59e0b') + '   Docker \u2022 Kubernetes \u2022 Linux \u2022 Nginx',
                '  ' + c('Cloud', '#f59e0b') + '            AWS \u2022 Azure \u2022 GCP \u2022 DigitalOcean',
                '  ' + c('Automation', '#f59e0b') + '       Ansible \u2022 Terraform \u2022 Python \u2022 Bash',
                '  ' + c('Monitoring', '#f59e0b') + '       Prometheus \u2022 Grafana \u2022 ELK \u2022 Datadog',
                '  ' + c('Data', '#f59e0b') + '             Hadoop \u2022 MongoDB \u2022 PostgreSQL \u2022 Redis',
                '  ' + c('Languages', '#f59e0b') + '        Python \u2022 JavaScript \u2022 Go \u2022 SQL',
                '  ' + c('AI/ML', '#f59e0b') + '            LLMs \u2022 N8N \u2022 RAG \u2022 Prompt Engineering',
                '',
                '  ' + c('Proficiency:', '#64748b'),
                '  Infrastructure  ' + c('\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588', '#4ade80') + ' 95%',
                '  Cloud           ' + c('\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588', '#4ade80') + c('\u2591', '#334155') + ' 90%',
                '  Automation      ' + c('\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588', '#4ade80') + c('\u2591\u2591', '#334155') + ' 88%',
                '  Development     ' + c('\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588', '#60a5fa') + c('\u2591\u2591\u2591', '#334155') + ' 82%',
                '  AI/ML           ' + c('\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588', '#a78bfa') + c('\u2591\u2591\u2591\u2591\u2591', '#334155') + ' 75%',
                ''
            ];
        },
        experience: function () {
            return [
                '',
                c('  Career Timeline', '#60a5fa'),
                c('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500', '#334155'),
                '',
                '  ' + c('2020-2021', '#4ade80') + '  ' + bold('HSBC Software Development'),
                '             Software Engineer',
                '             \u2022 Managed Hadoop clusters for banking ops',
                '             \u2022 Automated deployments with Ansible',
                '             \u2022 Ensured 99.9% uptime for critical systems',
                '             \u2022 Processed TB-scale data with ETL pipelines',
                '',
                '  ' + c('2019', '#f59e0b') + '       ' + bold('HCL Technologies'),
                '             Summer Intern',
                '             \u2022 Built cross-platform apps with Flutter',
                '             \u2022 Designed MongoDB schemas for scalable data',
                '',
                '  ' + c('2019', '#a78bfa') + '       ' + bold('Toise Tech Products'),
                '             Software Intern',
                '             \u2022 Developed Flutter mobile applications',
                '             \u2022 Integrated Firebase for real-time features',
                ''
            ];
        },
        education: function () {
            return [
                '',
                c('  Academic Background', '#60a5fa'),
                c('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500', '#334155'),
                '',
                '  ' + c('2017-2021', '#4ade80') + '  ' + bold('VIT University, Chennai'),
                '             B.Tech Computer Science',
                '             Distributed Systems & Data Engineering',
                '',
                '  ' + c('CBSE', '#f59e0b') + '       ' + bold('Summer Fields School, New Delhi'),
                '             Senior Secondary (Class XII & X)',
                '',
                c('  Distinctions', '#60a5fa'),
                c('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500', '#334155'),
                '  \ud83c\udfc6 E-Sports Champion \u2014 VIT Cultural Fest',
                '  \ud83e\udd4b 2x Gold \u2014 Taekwondo (Zonal & Delhi State)',
                '  \ud83d\udcaf Perfect Score \u2014 Information Technology',
                '  \ud83c\udf99 Debate & Public Speaking Championships',
                ''
            ];
        },
        projects: function () {
            return [
                '',
                c('  Project Portfolio', '#60a5fa'),
                c('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500', '#334155'),
                '',
                '  ' + c('\ud83d\ude80 Droppy', '#4ade80') + '              macOS Dynamic Island utility',
                '     Users: ' + c('5,000+', '#f59e0b') + '  Growth: ' + c('100x', '#f59e0b') + '  Rank: ' + c('#1 Trending', '#f59e0b'),
                '',
                '  ' + c('\ud83c\udfe0 Home Lab', '#4ade80') + '            Enterprise infrastructure',
                '     Uptime: ' + c('99.9%', '#f59e0b') + '  Monitoring: ' + c('24/7', '#f59e0b') + '  Self-healing',
                '',
                '  ' + c('\ud83e\udd16 N8N LLM Pipeline', '#4ade80') + '    GenAI automation',
                '     Efficiency: ' + c('90% time saved', '#f59e0b') + '  AI-powered filtering',
                '',
                '  Type ' + c('"goto projects"', '#a78bfa') + ' to view the full project cards.',
                ''
            ];
        },
        contact: function () {
            return [
                '',
                c('  Contact Information', '#60a5fa'),
                c('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500', '#334155'),
                '',
                '  ' + c('\ud83d\udce7 Email:', '#94a3b8') + '     vineetkishore01@gmail.com',
                '  ' + c('\ud83d\udcbc LinkedIn:', '#94a3b8') + '  linkedin.com/in/vineetkishore',
                '  ' + c('\ud83d\udc19 GitHub:', '#94a3b8') + '    github.com/vineetkishore',
                '  ' + c('\ud83d\udcfa YouTube:', '#94a3b8') + '   youtube.com/@vineetkishore',
                '',
                '  Type ' + c('"goto contact"', '#a78bfa') + ' to jump to the contact section.',
                ''
            ];
        },
        certifications: function () {
            return [
                '',
                c('  Professional Certifications', '#60a5fa'),
                c('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500', '#334155'),
                '',
                '  ' + c('\u2713', '#4ade80') + ' AWS Solutions Architect (in progress)',
                '  ' + c('\u2713', '#4ade80') + ' Docker Certified Associate',
                '  ' + c('\u2713', '#4ade80') + ' Kubernetes Administrator (CKA)',
                '  ' + c('\u2713', '#4ade80') + ' Linux Foundation Certified',
                ''
            ];
        },
        neofetch: function () {
            return [
                '',
                c('        _____', '#60a5fa') + '          ' + c('vineet', '#4ade80') + '@' + c('portfolio', '#60a5fa'),
                c('       /     \\', '#60a5fa') + '         \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500',
                c('      | () () |', '#60a5fa') + '        ' + c('OS:', '#f59e0b') + '      Web/macOS',
                c('       \\  ^  /', '#60a5fa') + '         ' + c('Host:', '#f59e0b') + '    command-center',
                c('        |||||', '#60a5fa') + '          ' + c('Kernel:', '#f59e0b') + '  JavaScript ES2024',
                c('        |||||', '#60a5fa') + '          ' + c('Shell:', '#f59e0b') + '   vineet-zsh 2.0',
                '                       ' + c('Theme:', '#f59e0b') + '   Dark [Quantum]',
                '                       ' + c('Stack:', '#f59e0b') + '   Docker/K8s/AWS',
                '                       ' + c('Editor:', '#f59e0b') + '  VS Code / Vim',
                '                       ' + c('Coffee:', '#f59e0b') + '  \u2615 Yes, always',
                '',
                '  ' + c('\u2588\u2588\u2588\u2588', '#ef4444') + c('\u2588\u2588\u2588\u2588', '#f59e0b') + c('\u2588\u2588\u2588\u2588', '#4ade80') + c('\u2588\u2588\u2588\u2588', '#3b82f6') + c('\u2588\u2588\u2588\u2588', '#a78bfa') + c('\u2588\u2588\u2588\u2588', '#ec4899'),
                ''
            ];
        },
        uptime: function () {
            var ms = Date.now() - startTime;
            var s = Math.floor(ms / 1000); var m = Math.floor(s / 60); var h = Math.floor(m / 60);
            s = s % 60; m = m % 60;
            var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
            return ['  Session uptime: ' + c(pad(h) + ':' + pad(m) + ':' + pad(s), '#4ade80') +
                '  |  Commands run: ' + c('' + history.length, '#60a5fa')];
        },
        date: function () { return ['  ' + c(new Date().toString(), '#4ade80')]; },
        ls: function () {
            return [
                '',
                c('  drwxr-xr-x', '#64748b') + '  ' + c('about/', '#60a5fa'),
                c('  drwxr-xr-x', '#64748b') + '  ' + c('experience/', '#60a5fa'),
                c('  drwxr-xr-x', '#64748b') + '  ' + c('projects/', '#60a5fa'),
                c('  drwxr-xr-x', '#64748b') + '  ' + c('skills/', '#60a5fa'),
                c('  drwxr-xr-x', '#64748b') + '  ' + c('education/', '#60a5fa'),
                c('  drwxr-xr-x', '#64748b') + '  ' + c('terminal/', '#60a5fa'),
                c('  drwxr-xr-x', '#64748b') + '  ' + c('contact/', '#60a5fa'),
                c('  -rw-r--r--', '#64748b') + '  resume.pdf',
                c('  -rw-r--r--', '#64748b') + '  readme.md',
                ''
            ];
        },
        cat: function () { return ['  Usage: ' + c('cat [filename]', '#f59e0b'), '  Try: cat readme.md']; },
        ping: function () {
            return [
                '  PING vineetkishore.dev (127.0.0.1): 56 data bytes',
                '  64 bytes: time=' + c((Math.random() * 5 + 1).toFixed(1) + 'ms', '#4ade80'),
                '  64 bytes: time=' + c((Math.random() * 5 + 1).toFixed(1) + 'ms', '#4ade80'),
                '  64 bytes: time=' + c((Math.random() * 5 + 1).toFixed(1) + 'ms', '#4ade80'),
                '  --- 3 packets, ' + c('0% loss', '#4ade80')
            ];
        },
        whois: function () {
            return [
                '  Domain: vineetkishore.dev',
                '  Registrant: Vineet Kishore',
                '  Status: ' + c('ACTIVE', '#4ade80'),
                '  Created: 2024'
            ];
        },
        weather: function () {
            var moods = [
                ['\u2600\ufe0f  Clear skies \u2014 Shipping code at full speed!', '#4ade80'],
                ['\u26c8  Thunderstorm \u2014 Debugging intensifies!', '#f59e0b'],
                ['\ud83d\ude80 Launch weather \u2014 Deploying to production!', '#a78bfa']
            ];
            var m = moods[Math.floor(Math.random() * moods.length)];
            return ['  Dev weather: ' + c(m[0], m[1])];
        },
        theme: function () {
            if (terminalBody.style.background === 'rgba(0, 20, 0, 0.9)') {
                terminalBody.style.background = '';
                return ['  Theme: ' + c('Default', '#60a5fa')];
            }
            terminalBody.style.background = 'rgba(0, 20, 0, 0.9)';
            return ['  Theme: ' + c('Matrix Green', '#4ade80')];
        },
        history: function () {
            if (history.length === 0) return ['  No commands in history.'];
            var out = ['']; var start = Math.max(0, history.length - 15);
            for (var i = start; i < history.length; i++) out.push('  ' + c('' + (i + 1), '#64748b') + '  ' + history[i]);
            out.push(''); return out;
        },
        clear: function () {
            var lines = terminalBody.querySelectorAll('.terminal-line');
            for (var i = 0; i < lines.length; i++) lines[i].remove();
            return [];
        },
        resume: function () {
            window.open('Vineet Kishore Resume.pdf', '_blank');
            return ['  ' + c('Opening resume in new tab...', '#4ade80')];
        },
        eastereggs: function () {
            return [
                '', c('  \ud83c\udfae Easter Egg Directory', '#f59e0b'), '',
                '  ' + c('matrix', '#4ade80') + '      Enter the Matrix',
                '  ' + c('sudo', '#4ade80') + '        Try to get root',
                '  ' + c('hack', '#4ade80') + '        Hack the planet',
                '  ' + c('rickroll', '#4ade80') + '    You know what this does',
                '  ' + c('cowsay', '#4ade80') + '      Moo!',
                '', '  Press ' + c('F', '#f59e0b') + ' for flashlight mode', ''
            ];
        },
        sudo: function () {
            return [
                '  ' + c('[sudo] password for vineet: ********', '#ef4444'),
                '  ' + c('Access denied.', '#ef4444') + ' Nice try! \ud83d\ude0f'
            ];
        },
        hack: function () {
            return [
                c('  [*] Initiating hack sequence...', '#4ade80'),
                '  ' + c('[\u2588\u2588\u2588\u2588\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591]', '#f59e0b') + ' 20%',
                '  ' + c('[\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591]', '#f59e0b') + ' 40%',
                '  ' + c('[\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2591\u2591\u2591\u2591\u2591\u2591]', '#f59e0b') + ' 60%',
                '  ' + c('[\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588]', '#4ade80') + ' 100%',
                '', c('  Just kidding! I\'m an ethical engineer. \ud83d\ude09', '#64748b')
            ];
        },
        matrix: function () {
            var el = document.createElement('div');
            el.style.cssText = 'position:fixed;inset:0;z-index:99999;pointer-events:none;overflow:hidden;';
            document.body.appendChild(el);
            var canvas = document.createElement('canvas');
            canvas.width = window.innerWidth; canvas.height = window.innerHeight;
            canvas.style.cssText = 'width:100%;height:100%;';
            el.appendChild(canvas);
            var ctx = canvas.getContext('2d');
            var cols = Math.floor(canvas.width / 16);
            var drops = [];
            for (var i = 0; i < cols; i++) drops[i] = Math.random() * -100;
            var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            var intv = setInterval(function () {
                ctx.fillStyle = 'rgba(0,0,0,0.05)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#0f0'; ctx.font = '16px monospace';
                for (var j = 0; j < drops.length; j++) {
                    ctx.fillText(chars[Math.floor(Math.random() * chars.length)], j * 16, drops[j] * 16);
                    if (drops[j] * 16 > canvas.height && Math.random() > 0.98) drops[j] = 0;
                    drops[j]++;
                }
            }, 40);
            setTimeout(function () { clearInterval(intv); el.remove(); }, 5000);
            return [c('  Matrix mode activated for 5 seconds...', '#4ade80')];
        },
        rickroll: function () {
            window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
            return [c('  Never gonna give you up! \ud83c\udfb5', '#ec4899')];
        },
        cowsay: function () {
            return [
                '   _________________________',
                '  < Hire Vineet! He\'s great! >',
                '   -------------------------',
                '          \\   ^__^',
                '           \\  (oo)\\_______',
                '              (__)\\       )\\/\\',
                '                  ||----w |',
                '                  ||     ||'
            ];
        },
        '?': function () {
            return [
                '',
                c('  \u2592\u2592\u2592  FULL SYSTEM MANIFEST  \u2592\u2592\u2592', '#60a5fa'),
                c('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500', '#334155'),
                '',
                c('  \u250c\u2500 KNOW ME', '#4ade80'),
                '  \u2502  ' + c('about', '#e2e8f0') + '  \u2022  ' + c('whoami', '#e2e8f0') + '  \u2022  ' + c('skills', '#e2e8f0'),
                '  \u2502  ' + c('experience', '#e2e8f0') + '  \u2022  ' + c('education', '#e2e8f0'),
                '  \u2502  ' + c('projects', '#e2e8f0') + '  \u2022  ' + c('certifications', '#e2e8f0'),
                '  \u2514  ' + c('contact', '#e2e8f0') + '  \u2022  ' + c('resume', '#e2e8f0'),
                '',
                c('  \u250c\u2500 HACK AROUND', '#f59e0b'),
                '  \u2502  ' + c('neofetch', '#e2e8f0') + '  \u2022  ' + c('uptime', '#e2e8f0') + '  \u2022  ' + c('date', '#e2e8f0'),
                '  \u2502  ' + c('ls', '#e2e8f0') + '  \u2022  ' + c('cat readme.md', '#e2e8f0') + '  \u2022  ' + c('ping', '#e2e8f0'),
                '  \u2502  ' + c('whois', '#e2e8f0') + '  \u2022  ' + c('weather', '#e2e8f0') + '  \u2022  ' + c('theme', '#e2e8f0'),
                '  \u2514  ' + c('history', '#e2e8f0') + '  \u2022  ' + c('clear', '#e2e8f0'),
                '',
                c('  \u250c\u2500 NAVIGATE', '#a78bfa'),
                '  \u2502  ' + c('goto home', '#e2e8f0') + '  \u2022  ' + c('goto about', '#e2e8f0') + '  \u2022  ' + c('goto projects', '#e2e8f0'),
                '  \u2514  ' + c('goto skills', '#e2e8f0') + '  \u2022  ' + c('goto contact', '#e2e8f0') + '  \u2022  ' + c('goto education', '#e2e8f0'),
                '',
                c('  \u250c\u2500 \ud83c\udf1f SECRETS \u2014 just try them.', '#ec4899'),
                '  \u2502  ' + c('matrix', '#e2e8f0') + '  \u2022  ' + c('sudo', '#e2e8f0') + '  \u2022  ' + c('hack', '#e2e8f0'),
                '  \u2514  ' + c('rickroll', '#e2e8f0') + '  \u2022  ' + c('cowsay', '#e2e8f0'),
                '',
                c('  \u250c\u2500 \u2328 KEYBOARD TRICKS', '#06b6d4'),
                '  \u2502  ' + c('\u2191 / \u2193', '#e2e8f0') + '       Browse command history',
                '  \u2502  ' + c('Tab', '#e2e8f0') + '         Autocomplete a command',
                '  \u2502  ' + c('Ctrl+L', '#e2e8f0') + '      Clear the screen',
                '  \u2514  ' + c('F', '#e2e8f0') + '           Toggle flashlight (outside terminal)',
                '',
                c('  Type any command above and hit Enter.', '#64748b'),
                c('  No manual needed. Just explore. \u26a1', '#64748b'),
                ''
            ];
        }
    };

    var catFiles = {
        'readme.md': function () {
            return [
                '', c('  # Vineet Kishore \u2014 Portfolio', '#60a5fa'), '',
                '  Welcome to my interactive command center.',
                '  Built with vanilla HTML/CSS/JS, GSAP, and Lenis.', ''
            ];
        },
        'resume.pdf': function () { commands.resume(); return [c('  Opening resume...', '#4ade80')]; }
    };

    function addLine(text, isCmd) {
        var el = document.createElement('div');
        el.className = 'terminal-line';
        el.style.cssText = 'margin-bottom:0.4rem;opacity:0;animation:fadeIn 0.3s forwards;';
        if (isCmd) {
            el.innerHTML = '<span class="terminal-prompt">\u279c</span> <span style="color:#4ade80">~</span> <span style="color:#e2e8f0">' + text.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span>';
        } else {
            el.innerHTML = text;
        }
        terminalBody.insertBefore(el, inputLine);
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    function run(cmd) {
        if (!cmd) return;
        history.push(cmd);
        historyIndex = history.length;
        addLine(cmd, true);

        if (cmd.indexOf('cat ') === 0) {
            var file = cmd.replace('cat ', '').trim();
            if (catFiles[file]) {
                var out = catFiles[file]();
                for (var i = 0; i < out.length; i++) {
                    (function (l, d) { setTimeout(function () { addLine(l, false); }, d); })(out[i], i * 30);
                }
            } else {
                addLine(c('  cat: ' + file + ': No such file', '#ef4444'), false);
            }
            setTimeout(focusInput, 100); return;
        }

        if (cmd.indexOf('goto ') === 0) {
            var sec = cmd.replace('goto ', '').trim();
            var map = {
                home: 'hero', about: 'about', experience: 'experience', projects: 'projects',
                skills: 'skills', education: 'education', terminal: 'terminal', contact: 'contact'
            };
            var tid = map[sec] || sec;
            var target = document.getElementById(tid);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                addLine('  Navigating to ' + c(sec, '#4ade80') + '...', false);
            } else {
                addLine(c('  Section "' + sec + '" not found.', '#ef4444') + ' Try: ' + c('ls', '#f59e0b'), false);
            }
            setTimeout(focusInput, 100); return;
        }

        if (commands[cmd]) {
            var out = commands[cmd]();
            if (out && out.length) {
                for (var i = 0; i < out.length; i++) {
                    (function (l, d) { setTimeout(function () { addLine(l, false); }, d); })(out[i], i * 30);
                }
            }
        } else {
            addLine(c('  Command not found: ', '#ef4444') + cmd + '. Type ' + c('"help"', '#4ade80') + ' for commands.', false);
        }
        setTimeout(focusInput, 100);
    }

    terminalInput.addEventListener('keydown', function (e) {
        e.stopPropagation();
        // Improve Enter key detection for iPad/Mobile
        if (e.key === 'Enter' || e.code === 'Enter' || e.keyCode === 13) {
            e.preventDefault();
            var val = terminalInput.value.trim().toLowerCase();
            if (val.length > 0) {
                run(val);
                terminalInput.value = '';
            }
        } else if (e.key === 'ArrowUp' || e.keyCode === 38) {
            e.preventDefault();
            if (history.length > 0 && historyIndex > 0) { historyIndex--; terminalInput.value = history[historyIndex]; }
        } else if (e.key === 'ArrowDown' || e.keyCode === 40) {
            e.preventDefault();
            if (historyIndex < history.length - 1) { historyIndex++; terminalInput.value = history[historyIndex]; }
            else { historyIndex = history.length; terminalInput.value = ''; }
        } else if (e.key === 'Tab' || e.keyCode === 9) {
            e.preventDefault();
            var val = terminalInput.value.trim().toLowerCase();
            if (val.length > 0) {
                var matches = [];
                for (var i = 0; i < allCmdNames.length; i++) {
                    if (allCmdNames[i].indexOf(val) === 0) matches.push(allCmdNames[i]);
                }
                if (matches.length === 1) terminalInput.value = matches[0];
                else if (matches.length > 1) addLine('  ' + matches.join('  '), false);
            }
        } else if ((e.key === 'l' || e.keyCode === 76) && (e.ctrlKey || e.metaKey)) {
            e.preventDefault(); commands.clear();
        }
    });
    terminalInput.addEventListener('keyup', function (e) { e.stopPropagation(); });
    terminalInput.addEventListener('keypress', function (e) { e.stopPropagation(); });

    setTimeout(focusInput, 1000);
    console.log('Terminal: Advanced standalone init complete');
})();
