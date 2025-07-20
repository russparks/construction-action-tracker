import React, { useState, useEffect } from 'react';
import { Plus, Edit2, X, Check, Filter, User, Calendar } from 'lucide-react';

const ActionTracker = () => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAction, setEditingAction] = useState(null);
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [filters, setFilters] = useState({
    discipline: 'All',
    status: 'All',
    person: 'All'
  });

  const disciplines = ['Precon', 'Production', 'Design', 'Commercial', 'Misc'];
  const statuses = ['Open', 'Closed'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discipline: 'Precon',
    assignee: '',
    priority: 'Medium',
    dueDate: '',
    status: 'Open',
    projectName: ''
  });

  const dueDateOptions = [
    { label: '2 D', value: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    { label: '1 Week', value: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    { label: '2 Weeks', value: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    { label: '3 Weeks', value: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    { label: '4 Weeks', value: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  ];

  // Fetch actions from API
  useEffect(() => {
    fetchActions();
  }, []);

  const fetchActions = async () => {
    try {
      const response = await fetch('/api/actions');
      const data = await response.json();
      setActions(data);
    } catch (error) {
      console.error('Failed to fetch actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const uniqueAssignees = [...new Set(actions.map(action => action.assignee).filter(Boolean))];

  const handleSubmit = async () => {
    if (!formData.title || !formData.assignee) {
      alert('Please fill in all required fields (Title and Assignee)');
      return;
    }

    try {
      if (editingAction) {
        const response = await fetch(`/api/actions/${editingAction.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const updatedAction = await response.json();
        setActions(actions.map(action => 
          action.id === editingAction.id ? updatedAction : action
        ));
        setEditingAction(null);
      } else {
        const response = await fetch('/api/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const newAction = await response.json();
        setActions([newAction, ...actions]);
      }
      resetForm();
    } catch (error) {
      console.error('Failed to save action:', error);
      alert('Failed to save action. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      discipline: 'Precon',
      assignee: '',
      priority: 'Medium',
      dueDate: '',
      status: 'Open',
      projectName: ''
    });
    setShowForm(false);
    setShowCustomDate(false);
  };

  const handleEdit = (action) => {
    setFormData(action);
    setEditingAction(action);
    setShowForm(true);
    // Show the custom date input when the existing due date does not match
    // one of the predefined quick select options
    const isCustom =
      action.dueDate &&
      !dueDateOptions.some((option) => option.value === action.dueDate);
    setShowCustomDate(isCustom);
  };

  const handleStatusChange = async (actionId, newStatus) => {
    try {
      const action = actions.find(a => a.id === actionId);
      const response = await fetch(`/api/actions/${actionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...action, status: newStatus })
      });
      const updatedAction = await response.json();
      setActions(actions.map(action =>
        action.id === actionId ? updatedAction : action
      ));
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const deleteAction = async (actionId) => {
    if (!confirm('Are you sure you want to delete this action?')) return;
    
    try {
      await fetch(`/api/actions/${actionId}`, { method: 'DELETE' });
      setActions(actions.filter(action => action.id !== actionId));
    } catch (error) {
      console.error('Failed to delete action:', error);
    }
  };

  // Filter actions
  const filteredActions = actions.filter(action => {
    return (
      (filters.discipline === 'All' || action.discipline === filters.discipline) &&
      (filters.status === 'All' || action.status === filters.status) &&
      (filters.person === 'All' || action.assignee === filters.person)
    );
  });

  const getDisciplineColor = (discipline) => {
    const colors = {
      'Precon': 'bg-purple-100 text-purple-800',
      'Production': 'bg-blue-100 text-blue-800',
      'Design': 'bg-green-100 text-green-800',
      'Commercial': 'bg-orange-100 text-orange-800',
      'Misc': 'bg-gray-100 text-gray-800'
    };
    return colors[discipline] || 'bg-gray-100 text-gray-800';
  };

  const getDisciplineButtonColor = (discipline) => {
    const colors = {
      'Precon': 'bg-purple-600 text-white',
      'Production': 'bg-blue-600 text-white',
      'Design': 'bg-green-600 text-white',
      'Commercial': 'bg-orange-600 text-white',
      'Misc': 'bg-gray-600 text-white'
    };
    return colors[discipline] || 'bg-gray-600 text-white';
  };

  const getStatusButtonColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-blue-600 text-white';
      case 'Closed': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getPriorityButtonColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-600 text-white';
      case 'High': return 'bg-orange-600 text-white';
      case 'Medium': return 'bg-yellow-600 text-white';
      case 'Low': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'Closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading actions...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Construction Action Tracker</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            New Action
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Total Actions</p>
            <p className="text-2xl font-bold text-blue-900">{actions.length}</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm text-yellow-600 font-medium">Open</p>
            <p className="text-2xl font-bold text-yellow-900">{actions.filter(a => a.status === 'Open').length}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Closed</p>
            <p className="text-2xl font-bold text-green-900">{actions.filter(a => a.status === 'Closed').length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={20} className="text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Discipline</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilters({...filters, discipline: 'All'})}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filters.discipline === 'All'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Disciplines
              </button>
              {disciplines.map(discipline => (
                <button
                  key={discipline}
                  onClick={() => setFilters({...filters, discipline})}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filters.discipline === discipline
                      ? getDisciplineButtonColor(discipline)
                      : filters.discipline === 'All'
                        ? getDisciplineButtonColor(discipline).replace('600', '400')
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {discipline}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilters({...filters, status: 'All'})}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filters.status === 'All'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Statuses
              </button>
              {statuses.map(status => (
                <button
                  key={status}
                  onClick={() => setFilters({...filters, status})}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filters.status === status
                      ? getStatusButtonColor(status)
                      : filters.status === 'All'
                        ? getStatusButtonColor(status).replace('600', '400')
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Assignee</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilters({...filters, person: 'All'})}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filters.person === 'All'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All People
              </button>
              {uniqueAssignees.map(person => (
                <button
                  key={person}
                  onClick={() => setFilters({...filters, person})}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filters.person === person
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {person}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingAction ? 'Edit Action' : 'New Action'}
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Action Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief action description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assignee *</label>
                <input
                  type="text"
                  required
                  value={formData.assignee}
                  onChange={(e) => setFormData({...formData, assignee: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Person responsible"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Construction project name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={2}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Detailed description"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discipline</label>
                <div className="flex flex-wrap gap-2">
                  {disciplines.map(discipline => (
                    <button
                      key={discipline}
                      type="button"
                      onClick={() => setFormData({...formData, discipline})}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        formData.discipline === discipline
                          ? getDisciplineButtonColor(discipline)
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {discipline}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <div className="flex flex-wrap gap-2">
                  {priorities.map(priority => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setFormData({...formData, priority})}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        formData.priority === priority
                          ? getPriorityButtonColor(priority)
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="flex flex-wrap gap-2">
                  {statuses.map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData({...formData, status})}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        formData.status === status
                          ? getStatusButtonColor(status)
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {dueDateOptions.map(option => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setFormData({...formData, dueDate: option.value})}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        formData.dueDate === option.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowCustomDate(!showCustomDate)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      showCustomDate
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                    }`}
                  >
                    Custom Date
                  </button>
                </div>
                {showCustomDate && (
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
              >
                {editingAction ? 'Update Action' : 'Create Action'}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setEditingAction(null);
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions List */}
      <div className="space-y-4">
        {filteredActions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500 text-lg">No actions found matching your filters.</p>
            <p className="text-gray-400 mt-2">Create your first action to get started!</p>
          </div>
        ) : (
          filteredActions.map(action => (
            <div key={action.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{action.title}</h3>
                    {action.projectName && (
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {action.projectName}
                      </span>
                    )}
                  </div>
                  
                  {action.description && (
                    <p className="text-gray-600 mb-3">{action.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDisciplineColor(action.discipline)}`}>
                      {action.discipline}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(action.status)}`}>
                      {action.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(action.priority)}`}>
                      {action.priority}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User size={16} />
                      <span>{action.assignee}</span>
                    </div>
                    {action.dueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>Due: {new Date(action.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="text-xs">
                      Created: {new Date(action.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {action.status !== 'Closed' && (
                    <button
                      onClick={() => handleStatusChange(action.id, 'Closed')}
                      className="bg-green-100 hover:bg-green-200 text-green-800 p-2 rounded-md transition-colors"
                      title="Mark as Closed"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleEdit(action)}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 p-2 rounded-md transition-colors"
                    title="Edit Action"
                  >
                    <Edit2 size={16} />
                  </button>
                  
                  <button
                    onClick={() => deleteAction(action.id)}
                    className="bg-red-100 hover:bg-red-200 text-red-800 p-2 rounded-md transition-colors"
                    title="Delete Action"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActionTracker;
