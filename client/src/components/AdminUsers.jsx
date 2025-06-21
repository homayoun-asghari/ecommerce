import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  Form, 
  InputGroup, 
  Table, 
  Badge, 
  Button, 
  Modal, 
  Pagination
} from 'react-bootstrap';
import { BsSearch, BsEye, BsFilterLeft } from 'react-icons/bs';
import { API_BASE_URL } from '../config';

const AdminUsers = () => {
  const { t, i18n } = useTranslation('adminUsers');
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
    totalSpent: 0,
    lastLogin: '',
    createdAt: ''
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

        const response = await fetch(`${API_BASE_URL}/admin/users?${queryParams}`);
        if (!response.ok) {
          throw new Error(t('errors.fetchUsers'));
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
  }, [searchTerm, roleFilter, currentPage, itemsPerPage, t]);

  // Fetch user details
  const fetchUserDetails = useCallback(async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/stats`);
      if (!response.ok) {
        throw new Error(t('errors.fetchUserStats'));
      }
      const data = await response.json();
      setUserStats({
        ...data,
        lastLogin: data.lastLogin ? new Date(data.lastLogin).toLocaleString(i18n.language) : t('userDetails.stats.never'),
        createdAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString(i18n.language) : ''
      });
      setShowDetails(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  }, [i18n.language, t]);

  const getRoleBadge = useCallback((role) => {
    const variants = {
      admin: 'danger',
      seller: 'primary',
      buyer: 'success'
    };
    const roleTranslations = {
      admin: t('roles.admin'),
      seller: t('roles.seller'),
      buyer: t('roles.buyer')
    };
    return <Badge bg={variants[role] || 'secondary'}>{roleTranslations[role] || role}</Badge>;
  }, [t]);

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
                  placeholder={t('search.placeholder')}
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
                <option value="all">{t('search.allRoles')}</option>
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
                <span className="visually-hidden">{t('table.loading')}</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead>
                  <tr>
                    <th>{t('table.columns.name')}</th>
                    <th>{t('table.columns.email')}</th>
                    <th>{t('table.columns.role')}</th>
                    <th>{t('table.columns.orders')}</th>
                    <th>{t('table.columns.joined')}</th>
                    <th>{t('table.columns.actions')}</th>
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
                        <td>{new Date(user.createdAt).toLocaleDateString(i18n.language)}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              fetchUserDetails(user.id);
                            }}
                          >
                            <BsEye className="me-1" /> {t('table.viewButton')}
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        {t('table.noUsers')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination className="mb-3">
                    <Pagination.First 
                      onClick={() => setCurrentPage(1)} 
                      disabled={currentPage === 1}
                      title={t('pagination.first')}
                    />
                    <Pagination.Prev 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                      disabled={currentPage === 1}
                      title={t('pagination.previous')}
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
                      title={t('pagination.next')}
                    />
                    <Pagination.Last 
                      onClick={() => setCurrentPage(totalPages)} 
                      disabled={currentPage === totalPages}
                      title={t('pagination.last')}
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
          <Modal.Title>{t('userDetails.title')}: {selectedUser?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div className="row">
              <div className="col-md-6">
                <h5>{t('userDetails.basicInfo')}</h5>
                <p><strong>{t('table.columns.name')}:</strong> {selectedUser.name}</p>
                <p><strong>{t('table.columns.email')}:</strong> {selectedUser.email}</p>
                <p><strong>{t('table.columns.role')}:</strong> {getRoleBadge(selectedUser.role)}</p>
                <p><strong>{t('userDetails.stats.memberSince')}:</strong> {userStats.createdAt}</p>
              </div>
              <div className="col-md-6">
                <h5>{t('userDetails.statistics')}</h5>
                <p><strong>{t('userDetails.stats.totalOrders')}:</strong> {userStats.orders || 0}</p>
                <p><strong>{t('userDetails.stats.totalReviews')}:</strong> {userStats.reviews || 0}</p>
                <p><strong>{t('userDetails.stats.totalSpent')}:</strong> ${(userStats.totalSpent || 0).toFixed(2)}</p>
                {userStats.lastLogin && (
                  <p><strong>{t('userDetails.stats.lastLogin')}:</strong> {userStats.lastLogin}</p>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            {t('userDetails.close')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminUsers;
