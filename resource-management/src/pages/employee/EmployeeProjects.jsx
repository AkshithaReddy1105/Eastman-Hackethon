import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getEmployeeProjectsWithDetails } from '../../services/database';
import {
  FolderKanban,
  ChevronDown,
  ChevronUp,
  Users,
  DollarSign,
  Calendar,
  Target,
  Clock,
  Search,
  Filter
} from 'lucide-react';

const EmployeeProjects = () => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedProjectId, setExpandedProjectId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadProjects();
  }, [currentUser]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await getEmployeeProjectsWithDetails(currentUser.uid);
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProjectExpansion = (projectId) => {
    setExpandedProjectId(expandedProjectId === projectId ? null : projectId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const projectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    onHold: projects.filter(p => p.status === 'on-hold').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
        <p className="text-gray-600 mt-1">
          View and manage all your project assignments
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {projectStats.total}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FolderKanban className="text-blue-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {projectStats.active}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Target className="text-green-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {projectStats.completed}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FolderKanban className="text-blue-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">On Hold</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {projectStats.onHold}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="text-yellow-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Projects ({filteredProjects.length})
        </h2>
        {filteredProjects.length > 0 ? (
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Project Header - Always Visible */}
                <div
                  className="p-4 bg-gray-50 cursor-pointer"
                  onClick={() => toggleProjectExpansion(project.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {project.name}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {project.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">My Role:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {project.myAllocation.role || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">My Allocation:</span>
                          <span className="ml-2 font-semibold text-blue-600">
                            {project.myAllocation.allocationPercentage}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Progress:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {project.progress || 0}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Team Size:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {project.teamMembers?.length || 0} members
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="ml-4 p-1 hover:bg-gray-200 rounded">
                      {expandedProjectId === project.id ? (
                        <ChevronUp size={20} className="text-gray-600" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Project Details */}
                {expandedProjectId === project.id && (
                  <div className="p-6 bg-white border-t border-gray-200">
                    <div className="space-y-6">
                      {/* Description */}
                      {project.description && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            Description
                          </h4>
                          <p className="text-sm text-gray-600">
                            {project.description}
                          </p>
                        </div>
                      )}

                      {/* Project Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Timeline */}
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Calendar size={20} className="text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-1">
                              Project Timeline
                            </h4>
                            <p className="text-sm text-gray-600">
                              Start:{' '}
                              {project.startDate
                                ? new Date(project.startDate).toLocaleDateString()
                                : 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600">
                              End:{' '}
                              {project.endDate
                                ? new Date(project.endDate).toLocaleDateString()
                                : 'N/A'}
                            </p>
                          </div>
                        </div>

                        {/* My Assignment Period */}
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Clock size={20} className="text-purple-600" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-1">
                              My Assignment Period
                            </h4>
                            <p className="text-sm text-gray-600">
                              Start:{' '}
                              {project.myAllocation.startDate
                                ? new Date(
                                    project.myAllocation.startDate
                                  ).toLocaleDateString()
                                : 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600">
                              End:{' '}
                              {project.myAllocation.endDate
                                ? new Date(
                                    project.myAllocation.endDate
                                  ).toLocaleDateString()
                                : 'N/A'}
                            </p>
                          </div>
                        </div>

                        {/* Budget Info */}
                        {project.budget && (
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <DollarSign size={20} className="text-green-600" />
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-1">
                                Project Budget
                              </h4>
                              <p className="text-sm text-gray-600">
                                ${project.budget.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Progress */}
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            <Target size={20} className="text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-700 mb-1">
                              Project Progress
                            </h4>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${project.progress || 0}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-700">
                                {project.progress || 0}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Project Manager */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Project Manager
                        </h4>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {project.managerName?.charAt(0) || 'M'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {project.managerName}
                            </p>
                            <p className="text-xs text-gray-600">
                              {project.managerEmail}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Team Members */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Users size={16} />
                          Team Members ({project.teamMembers?.length || 0})
                        </h4>
                        <div className="space-y-2">
                          {project.teamMembers?.map((member, index) => (
                            <div
                              key={index}
                              className={`flex items-center justify-between p-3 rounded-lg ${
                                member.employeeId === currentUser.uid
                                  ? 'bg-blue-50 border border-blue-200'
                                  : 'bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                  {member.employeeName?.charAt(0) || 'U'}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {member.employeeName}
                                    {member.employeeId === currentUser.uid && (
                                      <span className="ml-2 text-xs text-blue-600 font-semibold">
                                        (You)
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {member.role || 'Team Member'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900">
                                  {member.allocationPercentage}%
                                </p>
                                <p className="text-xs text-gray-500">
                                  allocation
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FolderKanban className="mx-auto text-gray-400" size={48} />
            <p className="text-gray-500 mt-4">
              {searchTerm || statusFilter !== 'all'
                ? 'No projects match your filters'
                : 'You are not currently assigned to any projects'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeProjects;
