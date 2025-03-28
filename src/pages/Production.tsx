
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
  Factory,
  Calendar,
  CheckCircle2
} from "lucide-react";
import { format } from "date-fns";
import { Production as ProductionType, ProductionMaterial, Status } from "@/types";

const Production = () => {
  const { productions, materials, addProduction, updateProduction, deleteProduction } = useData();
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [currentProduction, setCurrentProduction] = useState<ProductionType | null>(null);
  const [sortBy, setSortBy] = useState<string>("startDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  // Form states
  const [formData, setFormData] = useState({
    productionNumber: "",
    description: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: "",
    status: "PENDING" as Status,
    materials: [] as ProductionMaterial[],
    notes: ""
  });
  
  // Current material being added
  const [currentMaterial, setCurrentMaterial] = useState({
    materialId: "",
    plannedQuantity: 1,
    actualQuantity: undefined as number | undefined
  });
  
  // Generate next production number
  const generateProductionNumber = () => {
    const prefix = "PO-";
    const lastProduction = productions
      .map(p => p.productionNumber)
      .filter(num => num.startsWith(prefix))
      .map(num => parseInt(num.replace(prefix, ""), 10))
      .sort((a, b) => b - a)[0] || 0;
    
    return `${prefix}${lastProduction + 1}`;
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
  
  // Handle current material changes
  const handleMaterialChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === "materialId") {
      setCurrentMaterial({
        ...currentMaterial,
        materialId: value
      });
    } else {
      setCurrentMaterial({
        ...currentMaterial,
        [name]: value === "" ? undefined : Number(value)
      });
    }
  };
  
  // Add material to production
  const handleAddMaterial = () => {
    if (!currentMaterial.materialId || currentMaterial.plannedQuantity <= 0) {
      toast({
        title: "Error",
        description: "Please select a material and enter a valid quantity",
        variant: "destructive"
      });
      return;
    }
    
    const material = materials.find(m => m.id === currentMaterial.materialId);
    if (!material) return;
    
    const newMaterial: ProductionMaterial = {
      id: Math.random().toString(36).substring(2, 9),
      materialId: material.id,
      materialName: material.name,
      plannedQuantity: currentMaterial.plannedQuantity,
      actualQuantity: currentMaterial.actualQuantity,
      unit: material.unit
    };
    
    setFormData({
      ...formData,
      materials: [...formData.materials, newMaterial]
    });
    
    // Reset current material
    setCurrentMaterial({
      materialId: "",
      plannedQuantity: 1,
      actualQuantity: undefined
    });
  };
  
  // Update material in production (for completing)
  const handleUpdateMaterial = (materialId: string, actualQuantity: number) => {
    setFormData({
      ...formData,
      materials: formData.materials.map(material => 
        material.id === materialId ? 
        { ...material, actualQuantity } : 
        material
      )
    });
  };
  
  // Remove material from production
  const handleRemoveMaterial = (materialId: string) => {
    setFormData({
      ...formData,
      materials: formData.materials.filter(material => material.id !== materialId)
    });
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      productionNumber: generateProductionNumber(),
      description: "",
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: "",
      status: "PENDING",
      materials: [],
      notes: ""
    });
    setCurrentMaterial({
      materialId: "",
      plannedQuantity: 1,
      actualQuantity: undefined
    });
  };
  
  // Initialize form for adding
  const initAddForm = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };
  
  // Handle add production
  const handleAddProduction = () => {
    if (!formData.description || formData.materials.length === 0) {
      toast({
        title: "Error",
        description: "Please enter a description and add at least one material",
        variant: "destructive"
      });
      return;
    }
    
    addProduction({
      productionNumber: formData.productionNumber,
      description: formData.description,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      status: formData.status,
      materials: formData.materials,
      notes: formData.notes || undefined
    });
    
    resetForm();
    setIsAddDialogOpen(false);
  };
  
  // Handle view production
  const handleViewProduction = (production: ProductionType) => {
    setCurrentProduction(production);
    setIsViewDialogOpen(true);
  };
  
  // Handle edit production preparation
  const handleEditClick = (production: ProductionType) => {
    setCurrentProduction(production);
    setFormData({
      productionNumber: production.productionNumber,
      description: production.description,
      startDate: format(new Date(production.startDate), "yyyy-MM-dd"),
      endDate: production.endDate ? format(new Date(production.endDate), "yyyy-MM-dd") : "",
      status: production.status,
      materials: [...production.materials],
      notes: production.notes || ""
    });
    setIsEditDialogOpen(true);
  };
  
  // Handle update production
  const handleUpdateProduction = () => {
    if (!currentProduction || !formData.description || formData.materials.length === 0) return;
    
    updateProduction({
      ...currentProduction,
      description: formData.description,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      status: formData.status,
      materials: formData.materials,
      notes: formData.notes || undefined
    });
    
    resetForm();
    setIsEditDialogOpen(false);
  };
  
  // Handle complete production preparation
  const handleCompleteClick = (production: ProductionType) => {
    setCurrentProduction(production);
    setFormData({
      ...formData,
      productionNumber: production.productionNumber,
      description: production.description,
      startDate: format(new Date(production.startDate), "yyyy-MM-dd"),
      endDate: format(new Date(), "yyyy-MM-dd"),
      status: "COMPLETED",
      materials: production.materials.map(material => ({
        ...material,
        actualQuantity: material.actualQuantity || material.plannedQuantity
      })),
      notes: production.notes || ""
    });
    setIsCompleteDialogOpen(true);
  };
  
  // Handle complete production
  const handleCompleteProduction = () => {
    if (!currentProduction) return;
    
    // Check if all materials have actual quantities
    const allMaterialsHaveActual = formData.materials.every(
      material => material.actualQuantity !== undefined
    );
    
    if (!allMaterialsHaveActual) {
      toast({
        title: "Error",
        description: "Please enter actual quantities for all materials",
        variant: "destructive"
      });
      return;
    }
    
    updateProduction({
      ...currentProduction,
      endDate: new Date(formData.endDate).toISOString(),
      status: "COMPLETED",
      materials: formData.materials
    });
    
    resetForm();
    setIsCompleteDialogOpen(false);
  };
  
  // Handle delete production preparation
  const handleDeleteClick = (production: ProductionType) => {
    setCurrentProduction(production);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (!currentProduction) return;
    
    deleteProduction(currentProduction.id);
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
  
  // Filtered and sorted productions
  const filteredProductions = productions
    .filter(production => 
      filterStatus === "all" || production.status === filterStatus
    )
    .sort((a, b) => {
      let valueA: any = a[sortBy as keyof ProductionType];
      let valueB: any = b[sortBy as keyof ProductionType];
      
      if (sortBy === "startDate" || sortBy === "endDate") {
        valueA = new Date(a[sortBy] || 0).getTime();
        valueB = new Date(b[sortBy] || 0).getTime();
      } else if (typeof valueA === "string") {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }
      
      if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
      if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  
  // Table columns
  const columns = [
    {
      header: (
        <div className="flex items-center cursor-pointer" onClick={() => handleSort("productionNumber")}>
          Production #
          {sortBy === "productionNumber" && (
            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
          )}
        </div>
      ),
      accessor: "productionNumber",
      cell: (row: ProductionType) => (
        <Button 
          variant="link" 
          className="p-0 h-auto font-medium"
          onClick={() => handleViewProduction(row)}
        >
          {row.productionNumber}
        </Button>
      )
    },
    {
      header: (
        <div className="flex items-center cursor-pointer" onClick={() => handleSort("description")}>
          Description
          {sortBy === "description" && (
            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
          )}
        </div>
      ),
      accessor: "description",
    },
    {
      header: (
        <div className="flex items-center cursor-pointer" onClick={() => handleSort("startDate")}>
          Start Date
          {sortBy === "startDate" && (
            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
          )}
        </div>
      ),
      accessor: "startDate",
      cell: (row: ProductionType) => format(new Date(row.startDate), "MMM d, yyyy"),
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
      cell: (row: ProductionType) => <StatusBadge status={row.status} />,
    },
    {
      header: "Materials",
      accessor: "materials",
      cell: (row: ProductionType) => `${row.materials.length} materials`,
    },
    {
      header: "",
      accessor: "actions",
      cell: (row: ProductionType) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background">
            <DropdownMenuItem onClick={() => handleViewProduction(row)}>
              <Factory className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEditClick(row)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            {row.status !== "COMPLETED" && row.status !== "CANCELLED" && (
              <DropdownMenuItem onClick={() => handleCompleteClick(row)}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Complete
              </DropdownMenuItem>
            )}
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
        <h1 className="text-2xl font-bold">Production Management</h1>
        
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
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={initAddForm}>
                <Plus className="mr-2 h-4 w-4" />
                New Production
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Production</DialogTitle>
                <DialogDescription>
                  Enter the production details and required materials below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="productionNumber">Production Number</Label>
                    <Input
                      id="productionNumber"
                      name="productionNumber"
                      value={formData.productionNumber}
                      onChange={handleInputChange}
                      readOnly
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
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
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label>Required Materials</Label>
                  <div className="rounded-md border p-4">
                    <div className="grid grid-cols-5 gap-2 mb-2">
                      <div className="col-span-2">
                        <Select 
                          value={currentMaterial.materialId} 
                          onValueChange={(value) => setCurrentMaterial({...currentMaterial, materialId: value})}
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
                          name="plannedQuantity"
                          type="number"
                          min="1"
                          value={currentMaterial.plannedQuantity}
                          onChange={handleMaterialChange}
                          placeholder="Qty"
                        />
                      </div>
                      <div className="col-span-2">
                        <Button 
                          onClick={handleAddMaterial}
                          className="w-full"
                        >
                          Add Material
                        </Button>
                      </div>
                    </div>
                    
                    {formData.materials.length === 0 ? (
                      <p className="text-center text-muted-foreground py-2">
                        No materials added yet
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {formData.materials.map((material) => (
                          <div 
                            key={material.id}
                            className="flex items-center justify-between p-2 rounded-md bg-accent"
                          >
                            <div>
                              <p className="font-medium">{material.materialName}</p>
                              <p className="text-sm text-muted-foreground">
                                Planned: {material.plannedQuantity} {material.unit}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMaterial(material.id)}
                            >
                              <Trash className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
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
                <Button onClick={handleAddProduction}>Create Production</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DataTable columns={columns} data={filteredProductions} />
      
      {/* View Production Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Factory className="h-5 w-5" /> 
              Production: {currentProduction?.productionNumber}
            </DialogTitle>
          </DialogHeader>
          
          {currentProduction && (
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{currentProduction.description}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <StatusBadge status={currentProduction.status} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">
                    {format(new Date(currentProduction.startDate), "PPP")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-medium">
                    {currentProduction.endDate 
                      ? format(new Date(currentProduction.endDate), "PPP")
                      : "-"}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Materials</p>
                <div className="rounded-md border overflow-hidden">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-muted border-b">
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Material</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Planned Qty</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actual Qty</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Variance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {currentProduction.materials.map((material) => {
                        const variance = material.actualQuantity !== undefined 
                          ? material.actualQuantity - material.plannedQuantity
                          : null;
                        
                        return (
                          <tr key={material.id}>
                            <td className="px-4 py-2">
                              <span className="font-medium">{material.materialName}</span>
                            </td>
                            <td className="px-4 py-2 text-right">
                              {material.plannedQuantity} {material.unit}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {material.actualQuantity !== undefined 
                                ? `${material.actualQuantity} ${material.unit}`
                                : "-"}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {variance !== null ? (
                                <span className={
                                  variance > 0
                                    ? "text-destructive"
                                    : variance < 0
                                    ? "text-green-600"
                                    : ""
                                }>
                                  {variance > 0 ? "+" : ""}{variance} {material.unit}
                                </span>
                              ) : "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {currentProduction.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p>{currentProduction.notes}</p>
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
                    handleEditClick(currentProduction);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Production
                </Button>
                {currentProduction.status !== "COMPLETED" && currentProduction.status !== "CANCELLED" && (
                  <Button 
                    variant="default"
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      handleCompleteClick(currentProduction);
                    }}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Complete
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit Production Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Production</DialogTitle>
            <DialogDescription>
              Update the production details and materials.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-productionNumber">Production Number</Label>
                <Input
                  id="edit-productionNumber"
                  name="productionNumber"
                  value={formData.productionNumber}
                  readOnly
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input
                  id="edit-startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
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
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label>Required Materials</Label>
              <div className="rounded-md border p-4">
                <div className="grid grid-cols-5 gap-2 mb-2">
                  <div className="col-span-2">
                    <Select 
                      value={currentMaterial.materialId} 
                      onValueChange={(value) => setCurrentMaterial({...currentMaterial, materialId: value})}
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
                      name="plannedQuantity"
                      type="number"
                      min="1"
                      value={currentMaterial.plannedQuantity}
                      onChange={handleMaterialChange}
                      placeholder="Qty"
                    />
                  </div>
                  <div className="col-span-2">
                    <Button 
                      onClick={handleAddMaterial}
                      className="w-full"
                    >
                      Add Material
                    </Button>
                  </div>
                </div>
                
                {formData.materials.length === 0 ? (
                  <p className="text-center text-muted-foreground py-2">
                    No materials added yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {formData.materials.map((material) => (
                      <div 
                        key={material.id}
                        className="flex items-center justify-between p-2 rounded-md bg-accent"
                      >
                        <div>
                          <p className="font-medium">{material.materialName}</p>
                          <p className="text-sm text-muted-foreground">
                            Planned: {material.plannedQuantity} {material.unit}
                            {material.actualQuantity !== undefined && (
                              <span className="ml-2">
                                Actual: {material.actualQuantity} {material.unit}
                              </span>
                            )}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMaterial(material.id)}
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
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
            <Button onClick={handleUpdateProduction}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Complete Production Dialog */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Complete Production</DialogTitle>
            <DialogDescription>
              Enter the actual quantities used and complete the production order.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="complete-productionNumber">Production Number</Label>
                <Input
                  id="complete-productionNumber"
                  name="productionNumber"
                  value={formData.productionNumber}
                  readOnly
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="complete-endDate">End Date</Label>
                <Input
                  id="complete-endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="complete-description">Description</Label>
              <Input
                id="complete-description"
                name="description"
                value={formData.description}
                readOnly
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Materials Used</Label>
              <div className="rounded-md border p-4">
                {formData.materials.length === 0 ? (
                  <p className="text-center text-muted-foreground py-2">
                    No materials added
                  </p>
                ) : (
                  <div className="space-y-4">
                    {formData.materials.map((material) => (
                      <div 
                        key={material.id}
                        className="grid grid-cols-1 gap-2 p-2 rounded-md bg-accent"
                      >
                        <p className="font-medium">{material.materialName}</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Planned: {material.plannedQuantity} {material.unit}
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`actual-${material.id}`} className="text-sm">
                                Actual:
                              </Label>
                              <Input
                                id={`actual-${material.id}`}
                                type="number"
                                min="0"
                                step="0.01"
                                className="h-8"
                                value={material.actualQuantity || ""}
                                onChange={(e) => 
                                  handleUpdateMaterial(
                                    material.id, 
                                    e.target.value === "" ? 0 : Number(e.target.value)
                                  )
                                }
                              />
                              <span className="text-sm">{material.unit}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="complete-notes">Notes</Label>
              <Textarea
                id="complete-notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCompleteProduction}>Complete Production</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete Production {currentProduction?.productionNumber}? This action cannot be undone.
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

export default Production;
