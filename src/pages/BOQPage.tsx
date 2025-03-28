
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
  FileText,
  Calendar 
} from "lucide-react";
import { format } from "date-fns";
import { BOQ, BOQItem, Status } from "@/types";

const BOQPage = () => {
  const { boqs, materials, addBOQ, updateBOQ, deleteBOQ } = useData();
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentBOQ, setCurrentBOQ] = useState<BOQ | null>(null);
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  // Form states
  const [formData, setFormData] = useState({
    projectName: "",
    date: format(new Date(), "yyyy-MM-dd"),
    status: "PENDING" as Status,
    items: [] as BOQItem[],
    notes: ""
  });
  
  // Current item being added
  const [currentItem, setCurrentItem] = useState({
    materialId: "",
    quantity: 1,
    wastageFactor: 1.1
  });
  
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
  
  // Add item to BOQ
  const handleAddItem = () => {
    if (!currentItem.materialId || currentItem.quantity <= 0 || currentItem.wastageFactor < 1) {
      toast({
        title: "Error",
        description: "Please enter valid item details",
        variant: "destructive"
      });
      return;
    }
    
    const material = materials.find(m => m.id === currentItem.materialId);
    if (!material) return;
    
    const newItem: BOQItem = {
      id: Math.random().toString(36).substring(2, 9),
      materialId: material.id,
      materialName: material.name,
      quantity: currentItem.quantity,
      unit: material.unit,
      unitPrice: material.pricePerUnit,
      totalPrice: currentItem.quantity * material.pricePerUnit * currentItem.wastageFactor,
      wastageFactor: currentItem.wastageFactor
    };
    
    setFormData({
      ...formData,
      items: [...formData.items, newItem]
    });
    
    // Reset current item
    setCurrentItem({
      materialId: "",
      quantity: 1,
      wastageFactor: 1.1
    });
  };
  
  // Remove item from BOQ
  const handleRemoveItem = (itemId: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.id !== itemId)
    });
  };
  
  // Calculate total amount
  const calculateTotal = (items: BOQItem[]) => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      projectName: "",
      date: format(new Date(), "yyyy-MM-dd"),
      status: "PENDING",
      items: [],
      notes: ""
    });
    setCurrentItem({
      materialId: "",
      quantity: 1,
      wastageFactor: 1.1
    });
  };
  
  // Handle add BOQ
  const handleAddBOQ = () => {
    if (!formData.projectName || formData.items.length === 0) {
      toast({
        title: "Error",
        description: "Please enter a project name and add at least one item",
        variant: "destructive"
      });
      return;
    }
    
    addBOQ({
      projectName: formData.projectName,
      date: new Date(formData.date).toISOString(),
      status: formData.status,
      items: formData.items,
      totalAmount: calculateTotal(formData.items),
      notes: formData.notes || undefined
    });
    
    resetForm();
    setIsAddDialogOpen(false);
  };
  
  // Handle view BOQ
  const handleViewBOQ = (boq: BOQ) => {
    setCurrentBOQ(boq);
    setIsViewDialogOpen(true);
  };
  
  // Handle edit BOQ preparation
  const handleEditClick = (boq: BOQ) => {
    setCurrentBOQ(boq);
    setFormData({
      projectName: boq.projectName,
      date: format(new Date(boq.date), "yyyy-MM-dd"),
      status: boq.status,
      items: [...boq.items],
      notes: boq.notes || ""
    });
    setIsEditDialogOpen(true);
  };
  
  // Handle update BOQ
  const handleUpdateBOQ = () => {
    if (!currentBOQ || !formData.projectName || formData.items.length === 0) return;
    
    updateBOQ({
      ...currentBOQ,
      projectName: formData.projectName,
      date: new Date(formData.date).toISOString(),
      status: formData.status,
      items: formData.items,
      totalAmount: calculateTotal(formData.items),
      notes: formData.notes || undefined
    });
    
    resetForm();
    setIsEditDialogOpen(false);
  };
  
  // Handle delete BOQ preparation
  const handleDeleteClick = (boq: BOQ) => {
    setCurrentBOQ(boq);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (!currentBOQ) return;
    
    deleteBOQ(currentBOQ.id);
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
  
  // Filtered and sorted BOQs
  const filteredBOQs = boqs
    .filter(boq => 
      filterStatus === "all" || boq.status === filterStatus
    )
    .sort((a, b) => {
      let valueA: any = a[sortBy as keyof BOQ];
      let valueB: any = b[sortBy as keyof BOQ];
      
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
        <div className="flex items-center cursor-pointer" onClick={() => handleSort("projectName")}>
          Project Name
          {sortBy === "projectName" && (
            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
          )}
        </div>
      ),
      accessor: "projectName",
      cell: (row: BOQ) => (
        <Button 
          variant="link" 
          className="p-0 h-auto font-medium"
          onClick={() => handleViewBOQ(row)}
        >
          {row.projectName}
        </Button>
      )
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
      cell: (row: BOQ) => format(new Date(row.date), "MMM d, yyyy"),
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
      cell: (row: BOQ) => <StatusBadge status={row.status} />,
    },
    {
      header: "Items",
      accessor: "items",
      cell: (row: BOQ) => `${row.items.length} items`,
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
      cell: (row: BOQ) => formatCurrency(row.totalAmount),
    },
    {
      header: "",
      accessor: "actions",
      cell: (row: BOQ) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background">
            <DropdownMenuItem onClick={() => handleViewBOQ(row)}>
              <FileText className="mr-2 h-4 w-4" />
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
        <h1 className="text-2xl font-bold">Bill of Quantities (BOQ)</h1>
        
        <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0 w-full md:w-auto">
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
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New BOQ
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New BOQ</DialogTitle>
                <DialogDescription>
                  Enter the project details and material requirements below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input
                      id="projectName"
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleInputChange}
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
                
                <div className="grid gap-2">
                  <Label>Items</Label>
                  <div className="rounded-md border p-4">
                    <div className="grid grid-cols-6 gap-2 mb-2">
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
                      <div>
                        <Input
                          name="wastageFactor"
                          type="number"
                          min="1"
                          step="0.01"
                          value={currentItem.wastageFactor}
                          onChange={handleItemChange}
                          placeholder="Wastage"
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
                                {item.quantity} {item.unit} × {formatCurrency(item.unitPrice)} 
                                <span className="ml-1">(+{((item.wastageFactor - 1) * 100).toFixed(0)}% wastage)</span>
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
                <Button onClick={handleAddBOQ}>Create BOQ</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DataTable columns={columns} data={filteredBOQs} />
      
      {/* View BOQ Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> 
              Project: {currentBOQ?.projectName}
            </DialogTitle>
          </DialogHeader>
          
          {currentBOQ && (
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {format(new Date(currentBOQ.date), "PPP")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <StatusBadge status={currentBOQ.status} />
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Bill of Quantities</p>
                <div className="rounded-md border overflow-hidden">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-muted border-b">
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Material</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Quantity</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Unit Price</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Wastage</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {currentBOQ.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2">
                            <span className="font-medium">{item.materialName}</span>
                          </td>
                          <td className="px-4 py-2 text-right">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {((item.wastageFactor - 1) * 100).toFixed(0)}%
                          </td>
                          <td className="px-4 py-2 text-right font-medium">
                            {formatCurrency(item.totalPrice)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-muted">
                        <td colSpan={4} className="px-4 py-2 text-right font-bold">
                          Total Amount:
                        </td>
                        <td className="px-4 py-2 text-right font-bold">
                          {formatCurrency(currentBOQ.totalAmount)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              {currentBOQ.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p>{currentBOQ.notes}</p>
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
                    handleEditClick(currentBOQ);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit BOQ
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit BOQ Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit BOQ</DialogTitle>
            <DialogDescription>
              Update the project details and material requirements.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-projectName">Project Name</Label>
                <Input
                  id="edit-projectName"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
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
            
            <div className="grid gap-2">
              <Label>Items</Label>
              <div className="rounded-md border p-4">
                <div className="grid grid-cols-6 gap-2 mb-2">
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
                  <div>
                    <Input
                      name="wastageFactor"
                      type="number"
                      min="1"
                      step="0.01"
                      value={currentItem.wastageFactor}
                      onChange={handleItemChange}
                      placeholder="Wastage"
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
                            {item.quantity} {item.unit} × {formatCurrency(item.unitPrice)} 
                            <span className="ml-1">(+{((item.wastageFactor - 1) * 100).toFixed(0)}% wastage)</span>
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
            <Button onClick={handleUpdateBOQ}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the BOQ for {currentBOQ?.projectName}? This action cannot be undone.
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

export default BOQPage;
