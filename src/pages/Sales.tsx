
import { useState } from "react";
import { useData } from "@/context/DataContext";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash, 
  ArrowUpDown,
  ShoppingCart,
  Calendar 
} from "lucide-react";
import { format } from "date-fns";
import { Sale, SaleItem, Status } from "@/types";

const Sales = () => {
  const { sales, customers, materials, addSale, updateSale, deleteSale } = useData();
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentSale, setCurrentSale] = useState<Sale | null>(null);
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dateRange, setDateRange] = useState({
    start: "",
    end: ""
  });
  
  // Form states
  const [formData, setFormData] = useState({
    orderNumber: "",
    customerId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    status: "PENDING" as Status,
    items: [] as SaleItem[],
    notes: ""
  });
  
  // Current item being added
  const [currentItem, setCurrentItem] = useState({
    materialId: "",
    quantity: 1
  });
  
  // Generate next order number
  const generateOrderNumber = () => {
    const prefix = "SO-";
    const lastSale = sales
      .map(s => s.orderNumber)
      .filter(num => num.startsWith(prefix))
      .map(num => parseInt(num.replace(prefix, ""), 10))
      .sort((a, b) => b - a)[0] || 0;
    
    return `${prefix}${lastSale + 1}`;
  };
  
  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle status change
  const handleStatusChange = (value: string) => {
    setFormData({
      ...formData,
      status: value as Status
    });
  };
  
  // Handle customer change
  const handleCustomerChange = (value: string) => {
    setFormData({
      ...formData,
      customerId: value
    });
  };
  
  // Handle current item changes
  const handleItemChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCurrentItem({
      ...currentItem,
      [name]: name === "materialId" ? value : Number(value)
    });
  };
  
  // Add item to sale
  const handleAddItem = () => {
    if (!currentItem.materialId || currentItem.quantity <= 0) {
      toast({
        title: "Error",
        description: "Please select a material and enter a valid quantity",
        variant: "destructive"
      });
      return;
    }
    
    const material = materials.find(m => m.id === currentItem.materialId);
    if (!material) return;
    
    const newItem: SaleItem = {
      id: Math.random().toString(36).substring(2, 9),
      materialId: material.id,
      materialName: material.name,
      quantity: currentItem.quantity,
      unitPrice: material.pricePerUnit,
      totalPrice: currentItem.quantity * material.pricePerUnit
    };
    
    setFormData({
      ...formData,
      items: [...formData.items, newItem]
    });
    
    // Reset current item
    setCurrentItem({
      materialId: "",
      quantity: 1
    });
  };
  
  // Remove item from sale
  const handleRemoveItem = (itemId: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.id !== itemId)
    });
  };
  
  // Calculate total amount
  const calculateTotal = (items: SaleItem[]) => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      orderNumber: generateOrderNumber(),
      customerId: "",
      date: format(new Date(), "yyyy-MM-dd"),
      status: "PENDING",
      items: [],
      notes: ""
    });
    setCurrentItem({
      materialId: "",
      quantity: 1
    });
  };
  
  // Initialize form for adding
  const initAddForm = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };
  
  // Handle add sale
  const handleAddSale = () => {
    if (!formData.customerId || formData.items.length === 0) {
      toast({
        title: "Error",
        description: "Please select a customer and add at least one item",
        variant: "destructive"
      });
      return;
    }
    
    const customer = customers.find(c => c.id === formData.customerId);
    if (!customer) return;
    
    addSale({
      orderNumber: formData.orderNumber,
      customerId: customer.id,
      customerName: customer.name,
      date: new Date(formData.date).toISOString(),
      status: formData.status,
      items: formData.items,
      totalAmount: calculateTotal(formData.items),
      notes: formData.notes || undefined
    });
    
    resetForm();
    setIsAddDialogOpen(false);
  };
  
  // Handle view sale
  const handleViewSale = (sale: Sale) => {
    setCurrentSale(sale);
    setIsViewDialogOpen(true);
  };
  
  // Handle edit sale preparation
  const handleEditClick = (sale: Sale) => {
    setCurrentSale(sale);
    setFormData({
      orderNumber: sale.orderNumber,
      customerId: sale.customerId,
      date: format(new Date(sale.date), "yyyy-MM-dd"),
      status: sale.status,
      items: [...sale.items],
      notes: sale.notes || ""
    });
    setIsEditDialogOpen(true);
  };
  
  // Handle update sale
  const handleUpdateSale = () => {
    if (!currentSale || !formData.customerId || formData.items.length === 0) return;
    
    const customer = customers.find(c => c.id === formData.customerId);
    if (!customer) return;
    
    updateSale({
      ...currentSale,
      customerId: customer.id,
      customerName: customer.name,
      date: new Date(formData.date).toISOString(),
      status: formData.status,
      items: formData.items,
      totalAmount: calculateTotal(formData.items),
      notes: formData.notes || undefined
    });
    
    resetForm();
    setIsEditDialogOpen(false);
  };
  
  // Handle delete sale preparation
  const handleDeleteClick = (sale: Sale) => {
    setCurrentSale(sale);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (!currentSale) return;
    
    deleteSale(currentSale.id);
    setIsDeleteDialogOpen(false);
  };
  
  // Handle sort
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };
  
  // Handle date range change
  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange({
      ...dateRange,
      [name]: value
    });
  };
  
  // Filtered and sorted sales
  const filteredSales = sales
    .filter(sale => 
      filterStatus === "all" || sale.status === filterStatus
    )
    .filter(sale => {
      if (!dateRange.start && !dateRange.end) return true;
      
      const saleDate = new Date(sale.date);
      const startDate = dateRange.start ? new Date(dateRange.start) : new Date(0);
      const endDate = dateRange.end ? new Date(dateRange.end) : new Date(9999, 11, 31);
      
      return saleDate >= startDate && saleDate <= endDate;
    })
    .sort((a, b) => {
      let valueA: any = a[sortBy as keyof Sale];
      let valueB: any = b[sortBy as keyof Sale];
      
      if (sortBy === "date") {
        valueA = new Date(a.date).getTime();
        valueB = new Date(b.date).getTime();
      } else if (typeof valueA === "string") {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }
      
      if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
      if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };
  
  // Table columns
  const columns = [
    {
      header: (
        <div className="flex items-center cursor-pointer" onClick={() => handleSort("orderNumber")}>
          Order Number
          {sortBy === "orderNumber" && (
            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
          )}
        </div>
      ),
      accessor: "orderNumber",
      cell: (row: Sale) => (
        <Button 
          variant="link" 
          className="p-0 h-auto font-medium"
          onClick={() => handleViewSale(row)}
        >
          {row.orderNumber}
        </Button>
      )
    },
    {
      header: (
        <div className="flex items-center cursor-pointer" onClick={() => handleSort("customerName")}>
          Customer
          {sortBy === "customerName" && (
            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
          )}
        </div>
      ),
      accessor: "customerName",
    },
    {
      header: (
        <div className="flex items-center cursor-pointer" onClick={() => handleSort("date")}>
          Date
          {sortBy === "date" && (
            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
          )}
        </div>
      ),
      accessor: "date",
      cell: (row: Sale) => format(new Date(row.date), "MMM d, yyyy"),
    },
    {
      header: (
        <div className="flex items-center cursor-pointer" onClick={() => handleSort("status")}>
          Status
          {sortBy === "status" && (
            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
          )}
        </div>
      ),
      accessor: "status",
      cell: (row: Sale) => <StatusBadge status={row.status} />,
    },
    {
      header: "Items",
      accessor: "items",
      cell: (row: Sale) => `${row.items.length} items`,
    },
    {
      header: (
        <div className="flex items-center cursor-pointer" onClick={() => handleSort("totalAmount")}>
          Total
          {sortBy === "totalAmount" && (
            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
          )}
        </div>
      ),
      accessor: "totalAmount",
      cell: (row: Sale) => formatCurrency(row.totalAmount),
    },
    {
      header: "",
      accessor: "actions",
      cell: (row: Sale) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background">
            <DropdownMenuItem onClick={() => handleViewSale(row)}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEditClick(row)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDeleteClick(row)}
              className="text-destructive"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="container px-4 py-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Sales Management</h1>
        
        <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0 w-full md:w-auto">
          <div className="flex gap-2">
            <Input
              type="date"
              name="start"
              value={dateRange.start}
              onChange={handleDateRangeChange}
              className="w-full md:w-40"
              placeholder="Start Date"
            />
            <Input
              type="date"
              name="end"
              value={dateRange.end}
              onChange={handleDateRangeChange}
              className="w-full md:w-40"
              placeholder="End Date"
            />
          </div>
          
          <Select 
            value={filterStatus} 
            onValueChange={setFilterStatus}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={initAddForm}>
                <Plus className="mr-2 h-4 w-4" />
                New Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Sale</DialogTitle>
                <DialogDescription>
                  Enter the details of the new sale order below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="orderNumber">Order Number</Label>
                    <Input
                      id="orderNumber"
                      name="orderNumber"
                      value={formData.orderNumber}
                      onChange={handleInputChange}
                      readOnly
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="customerId">Customer</Label>
                    <Select 
                      value={formData.customerId} 
                      onValueChange={handleCustomerChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={handleStatusChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label>Items</Label>
                  <div className="rounded-md border p-4">
                    <div className="grid grid-cols-5 gap-2 mb-2">
                      <div className="col-span-2">
                        <Select 
                          value={currentItem.materialId} 
                          onValueChange={(value) => setCurrentItem({...currentItem, materialId: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select material" />
                          </SelectTrigger>
                          <SelectContent>
                            {materials.map((material) => (
                              <SelectItem key={material.id} value={material.id}>
                                {material.name} ({material.unit})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Input
                          name="quantity"
                          type="number"
                          min="1"
                          value={currentItem.quantity}
                          onChange={handleItemChange}
                          placeholder="Qty"
                        />
                      </div>
                      <div className="col-span-2">
                        <Button 
                          onClick={handleAddItem}
                          className="w-full"
                        >
                          Add Item
                        </Button>
                      </div>
                    </div>
                    
                    {formData.items.length === 0 ? (
                      <p className="text-center text-muted-foreground py-2">
                        No items added yet
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {formData.items.map((item) => (
                          <div 
                            key={item.id}
                            className="flex items-center justify-between p-2 rounded-md bg-accent"
                          >
                            <div>
                              <p className="font-medium">{item.materialName}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.quantity} x {formatCurrency(item.unitPrice)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {formatCurrency(item.totalPrice)}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                <Trash className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <div className="flex justify-between pt-2">
                          <p className="font-medium">Total:</p>
                          <p className="font-bold">
                            {formatCurrency(calculateTotal(formData.items))}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSale}>Create Sale</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DataTable columns={columns} data={filteredSales} />
      
      {/* View Sale Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" /> 
              Sale Order: {currentSale?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          
          {currentSale && (
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{currentSale.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {format(new Date(currentSale.date), "PPP")}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <StatusBadge status={currentSale.status} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-bold">{formatCurrency(currentSale.totalAmount)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Items</p>
                <div className="rounded-md border divide-y">
                  {currentSale.items.map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between p-3"
                    >
                      <div>
                        <p className="font-medium">{item.materialName}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatCurrency(item.totalPrice)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              {currentSale.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p>{currentSale.notes}</p>
                </div>
              )}
              
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button 
                  variant="default"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleEditClick(currentSale);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Sale
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit Sale Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Sale</DialogTitle>
            <DialogDescription>
              Update the details of the sale order.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-orderNumber">Order Number</Label>
                <Input
                  id="edit-orderNumber"
                  name="orderNumber"
                  value={formData.orderNumber}
                  readOnly
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-customerId">Customer</Label>
                <Select 
                  value={formData.customerId} 
                  onValueChange={handleCustomerChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Items</Label>
              <div className="rounded-md border p-4">
                <div className="grid grid-cols-5 gap-2 mb-2">
                  <div className="col-span-2">
                    <Select 
                      value={currentItem.materialId} 
                      onValueChange={(value) => setCurrentItem({...currentItem, materialId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materials.map((material) => (
                          <SelectItem key={material.id} value={material.id}>
                            {material.name} ({material.unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Input
                      name="quantity"
                      type="number"
                      min="1"
                      value={currentItem.quantity}
                      onChange={handleItemChange}
                      placeholder="Qty"
                    />
                  </div>
                  <div className="col-span-2">
                    <Button 
                      onClick={handleAddItem}
                      className="w-full"
                    >
                      Add Item
                    </Button>
                  </div>
                </div>
                
                {formData.items.length === 0 ? (
                  <p className="text-center text-muted-foreground py-2">
                    No items added yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {formData.items.map((item) => (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-md bg-accent"
                      >
                        <div>
                          <p className="font-medium">{item.materialName}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} x {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {formatCurrency(item.totalPrice)}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2">
                      <p className="font-medium">Total:</p>
                      <p className="font-bold">
                        {formatCurrency(calculateTotal(formData.items))}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSale}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete Sale Order {currentSale?.orderNumber}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sales;
