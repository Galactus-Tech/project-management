import React, { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import MyTasksSidebar from './MyTasksSidebar';
import ProjectSidebar from './ProjectsSidebar';
import WorkspaceDropdown from './WorkspaceDropdown';
import { FolderOpenIcon, LayoutDashboardIcon, SettingsIcon, UsersIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const location = useLocation();
    const menuItems = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboardIcon },
        { name: 'Projects', href: '/projects', icon: FolderOpenIcon },
        { name: 'Team', href: '/team', icon: UsersIcon },
    ];

    const sidebarRef = useRef<HTMLDivElement>(null);

    // Auto-close on route change for mobile/tablet
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname, setIsSidebarOpen]);

    // Handle Escape key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isSidebarOpen) {
                setIsSidebarOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSidebarOpen, setIsSidebarOpen]);

    // Close when clicking outside on mobile/tablet
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                isSidebarOpen &&
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target as Node)
            ) {
                setIsSidebarOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isSidebarOpen, setIsSidebarOpen]);

    return (
        <>
            {/* Backdrop overlay for mobile and tablet */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            <aside
                ref={sidebarRef}
                id="app-sidebar"
                role="navigation"
                aria-label="Main Navigation"
                className={`fixed lg:static inset-y-0 left-0 z-50 w-72 min-w-72 bg-white dark:bg-zinc-900 flex flex-col h-screen border-r border-zinc-200 dark:border-zinc-800 shadow-xl lg:shadow-none transition-transform duration-300 ease-in-out ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
            >
                {/* Header with Workspace Switcher & Close button for mobile */}
                <div className="flex items-center justify-between pr-2">
                    <div className="flex-1 min-w-0">
                        <WorkspaceDropdown />
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden size-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                        aria-label="Close navigation sidebar"
                    >
                        <X className="size-4" />
                    </Button>
                </div>

                <hr className="border-zinc-200 dark:border-zinc-800" />

                <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
                    <div>
                        <div className="p-3 space-y-1">
                            {menuItems.map((item) => (
                                <NavLink
                                    to={item.href}
                                    key={item.name}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 py-2 px-3.5 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-blue-500 outline-none ${
                                            isActive
                                                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold'
                                                : 'hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60'
                                        }`
                                    }
                                >
                                    <item.icon className="size-4 shrink-0 text-zinc-500 dark:text-zinc-400" />
                                    <span className="truncate">{item.name}</span>
                                </NavLink>
                            ))}
                        </div>

                        <MyTasksSidebar />
                        <ProjectSidebar />
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
