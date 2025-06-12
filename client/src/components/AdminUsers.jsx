import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  InputGroup, 
  Table, 
  Badge, 
  Button, 
  Modal, 
  Pagination,
  Spinner
} from 'react-bootstrap';
import { BsSearch, BsEye, BsFilterLeft, BsArrowLeft, BsArrowRight } from 'react-icons/bs';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [userStats, setUserStats] = useState({
    orders: 0,
    reviews: 0,
    totalSpent: 0
  });

  // Fetch users with pagination and filters
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams({
          search: searchTerm,
          role: roleFilter === 'all' ? '' : roleFilter,
          page: currentPage,
          limit: itemsPerPage
        }).toString();

        const response = await fetch(`http://localhost:5050/admin/users?${queryParams}`);
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const data = await response.json();
        setUsers(data.users);
        setTotalPages(data.pagination.pages);
        
        // Set available roles for filter dropdown
        if (data.filters?.roles) {
          setAvailableRoles(data.filters.roles);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, roleFilter, currentPage, itemsPerPage]);

  // Fetch user details
  const fetchUserDetails = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5050/admin/users/${userId}/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch user stats');
      }
      const data = await response.json();
      setUserStats(data);
      setShowDetails(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const getRoleBadge = (role) => {
    const variants = {
      admin: 'danger',
      seller: 'primary',
      buyer: 'success'
    };
    return <Badge bg={variants[role] || 'secondary'}>{role}</Badge>;
  };

  return (
    <div className="p-3">
      <Card className="mb-4">
        <Card.Header>
        <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
            <div style={{ maxWidth: '300px' }}>
              <InputGroup>
                <InputGroup.Text><BsSearch /></InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </div>

            <div className="d-flex align-items-center gap-2">
              <BsFilterLeft size={20} />
              <Form.Select
                style={{ minWidth: '150px' }}
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1); // Reset to first page when filter changes
                }}
              >
                <option value="all">All Roles</option>
                {availableRoles.map(role => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </Form.Select>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          
          {loading ? (
            <div className="text-center my-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Orders</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{getRoleBadge(user.role)}</td>
                        <td>{user.order_count || 0}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              fetchUserDetails(user.id);
                            }}
                          >
                            <BsEye className="me-1" /> View
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.First 
                      onClick={() => setCurrentPage(1)} 
                      disabled={currentPage === 1} 
                    />
                    <Pagination.Prev 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                      disabled={currentPage === 1} 
                    />
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      return (
                        <Pagination.Item 
                          key={page}
                          active={page === currentPage}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Pagination.Item>
                      );
                    })}
                    <Pagination.Next 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                      disabled={currentPage === totalPages} 
                    />
                    <Pagination.Last 
                      onClick={() => setCurrentPage(totalPages)} 
                      disabled={currentPage === totalPages} 
                    />
                  </Pagination>
                </div>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* User Details Modal */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>User Details: {selectedUser?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div className="row">
              <div className="col-md-6">
                <h5>Basic Information</h5>
                <p><strong>Name:</strong> {selectedUser.name}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Role:</strong> {getRoleBadge(selectedUser.role)}</p>
                <p><strong>Joined:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="col-md-6">
                <h5>Statistics</h5>
                <p><strong>Total Orders:</strong> {userStats.orders}</p>
                <p><strong>Total Reviews:</strong> {userStats.reviews}</p>
                <p><strong>Total Spent:</strong> ${userStats.totalSpent?.toFixed(2)}</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminUsers;
