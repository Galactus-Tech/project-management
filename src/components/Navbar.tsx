import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MoonIcon,
    SunIcon,
    SearchIcon,
    PanelLeft,
    User,
    Settings,
    LogOut,
    FolderKanban,
    CheckSquare,
    X,
    ArrowRight,
    Command,
} from 'lucide-react';
import { assets } from '../assets/assets';
import { toggleTheme } from '../features/themeSlice';
import { useAppDispatch, useAppSelector } from '../app/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavbarProps {
    isSidebarOpen?: boolean;
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Navbar: React.FC<NavbarProps> = ({ isSidebarOpen = false, setIsSidebarOpen }) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { theme } = useAppSelector((state) => state.theme);
    const { user, currentWorkspace } = useAppSelector((state) => state.workspace);

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // Global keyboard shortcut: Ctrl+K or Cmd+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
                setIsSearchOpen(true);
            }
            if (e.key === 'Escape') {
                setIsSearchOpen(false);
                searchInputRef.current?.blur();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Dismiss search dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(e.target as Node)
            ) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter projects & tasks
    const query = searchQuery.toLowerCase().trim();
    const projects = currentWorkspace?.projects || [];
    const allTasks = projects.flatMap((p) => p.tasks || []);

    const matchedProjects = query
        ? projects.filter(
              (p) =>
                  p.name.toLowerCase().includes(query) ||
                  p.description?.toLowerCase().includes(query)
          ).slice(0, 4)
        : [];

    const matchedTasks = query
        ? allTasks.filter(
              (t) =>
                  t.title.toLowerCase().includes(query) ||
                  t.description?.toLowerCase().includes(query)
          ).slice(0, 5)
        : [];

    const hasResults = matchedProjects.length > 0 || matchedTasks.length > 0;

    const handleSelectProject = (projectId: string) => {
        setIsSearchOpen(false);
        setSearchQuery('');
        navigate(`/projectsDetail?id=${projectId}&tab=overview`);
    };

    const handleSelectTask = (projectId: string, taskId: string) => {
        setIsSearchOpen(false);
        setSearchQuery('');
        navigate(`/taskDetails?projectId=${projectId}&taskId=${taskId}`);
    };

    return (
        <header className="w-full bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 xl:px-12 py-3 shrink-0 relative z-30">
            <div className="flex items-center justify-between max-w-6xl mx-auto gap-3">
                {/* Left section: Sidebar trigger & Search Bar */}
                <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                    {/* Sidebar Trigger */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsSidebarOpen((prev) => !prev)}
                                className="lg:hidden shrink-0 transition-transform duration-150 active:scale-95"
                                aria-label={isSidebarOpen ? "Close navigation menu" : "Open navigation menu"}
                                aria-expanded={isSidebarOpen}
                                aria-controls="app-sidebar"
                            >
                                <PanelLeft className="size-5 text-zinc-600 dark:text-zinc-400" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            {isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                        </TooltipContent>
                    </Tooltip>

                    {/* Interactive Search Bar Container */}
                    <div ref={searchContainerRef} className="relative flex-1 max-w-md">
                        <div className="relative">
                            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 size-4 pointer-events-none" />
                            <Input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setIsSearchOpen(true);
                                }}
                                onFocus={() => {
                                    if (searchQuery.trim()) setIsSearchOpen(true);
                                }}
                                placeholder="Search projects, tasks... (⌘K)"
                                className="pl-9 pr-16 h-9 text-xs sm:text-sm rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/80 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
                                aria-label="Search projects and tasks across workspace"
                            />
                            {searchQuery ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setIsSearchOpen(false);
                                        searchInputRef.current?.focus();
                                    }}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-md transition-colors"
                                    aria-label="Clear search query"
                                >
                                    <X className="size-3.5" />
                                </button>
                            ) : (
                                <kbd className="hidden sm:inline-flex items-center gap-0.5 absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 bg-zinc-200/60 dark:bg-zinc-700/60 rounded border border-zinc-300/50 dark:border-zinc-600/50 pointer-events-none">
                                    <Command className="size-2.5" />K
                                </kbd>
                            )}
                        </div>

                        {/* Search Results Popover Dropdown */}
                        {isSearchOpen && query.length > 0 && (
                            <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto p-2 divide-y divide-zinc-100 dark:divide-zinc-800 animate-in fade-in-50 zoom-in-95">
                                {!hasResults ? (
                                    <div className="p-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
                                        No projects or tasks match "<span className="font-semibold text-zinc-800 dark:text-zinc-200">{searchQuery}</span>"
                                    </div>
                                ) : (
                                    <>
                                        {/* Projects Group */}
                                        {matchedProjects.length > 0 && (
                                            <div className="pb-2">
                                                <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                                                    <FolderKanban className="size-3.5 text-blue-500" />
                                                    Projects ({matchedProjects.length})
                                                </div>
                                                <div className="space-y-1">
                                                    {matchedProjects.map((p) => (
                                                        <button
                                                            key={p.id}
                                                            type="button"
                                                            onClick={() => handleSelectProject(p.id)}
                                                            className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors group cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
                                                        >
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                                                                    {p.name}
                                                                </p>
                                                                {p.description && (
                                                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                                                                        {p.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                                    {p.status}
                                                                </Badge>
                                                                <ArrowRight className="size-3 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Tasks Group */}
                                        {matchedTasks.length > 0 && (
                                            <div className="pt-2">
                                                <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                                                    <CheckSquare className="size-3.5 text-emerald-500" />
                                                    Tasks ({matchedTasks.length})
                                                </div>
                                                <div className="space-y-1">
                                                    {matchedTasks.map((t) => (
                                                        <button
                                                            key={t.id}
                                                            type="button"
                                                            onClick={() => handleSelectTask(t.projectId, t.id)}
                                                            className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors group cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
                                                        >
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                                                                    {t.title}
                                                                </p>
                                                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 capitalize">
                                                                    {t.type.toLowerCase()} • {t.status.replace('_', ' ').toLowerCase()}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                                                <Badge
                                                                    variant={
                                                                        t.priority === 'HIGH'
                                                                            ? 'destructive'
                                                                            : t.priority === 'MEDIUM'
                                                                            ? 'secondary'
                                                                            : 'outline'
                                                                    }
                                                                    className="text-[10px] px-1.5 py-0"
                                                                >
                                                                    {t.priority}
                                                                </Badge>
                                                                <ArrowRight className="size-3 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right section: Theme Toggle and User Menu with Tooltips */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {/* Theme Toggle Tooltip */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => dispatch(toggleTheme())}
                                className="size-9 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:scale-105 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
                                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                            >
                                {theme === 'light' ? (
                                    <MoonIcon className="size-4 text-zinc-800 dark:text-zinc-200" />
                                ) : (
                                    <SunIcon className="size-4 text-yellow-500" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            {theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
                        </TooltipContent>
                    </Tooltip>

                    {/* User Dropdown */}
                    <DropdownMenu>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="relative size-8 rounded-full p-0 focus-visible:ring-2 focus-visible:ring-blue-500 hover:scale-105 transition-transform duration-150 cursor-pointer"
                                        aria-label="Open user profile menu"
                                    >
                                        <Avatar className="size-8 ring-1 ring-zinc-200 dark:ring-zinc-800">
                                            <AvatarImage
                                                src={user?.image || assets.profile_img_a}
                                                alt={user?.name || 'User'}
                                            />
                                            <AvatarFallback className="text-xs font-semibold">
                                                {user?.name?.[0] || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Account profile</TooltipContent>
                        </Tooltip>

                        <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-xl">
                            <DropdownMenuLabel className="font-normal p-2">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-xs font-semibold leading-none text-zinc-900 dark:text-zinc-100">
                                        {user?.name || 'User'}
                                    </p>
                                    <p className="text-[11px] leading-none text-zinc-500 dark:text-zinc-400">
                                        {user?.email || 'user@example.com'}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => navigate('/team')}
                                className="cursor-pointer text-xs rounded-md"
                            >
                                <User className="mr-2 size-3.5" />
                                <span>Team & Workspace</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => navigate('/projects')}
                                className="cursor-pointer text-xs rounded-md"
                            >
                                <Settings className="mr-2 size-3.5" />
                                <span>Projects Directory</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-xs rounded-md text-red-600 dark:text-red-400 focus:text-red-600">
                                <LogOut className="mr-2 size-3.5" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
