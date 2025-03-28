
import { useState } from "react";
import { useData } from "@/context/DataContext";
import DataTable from "@/components/DataTable";
import StockLevelIndicator from "@/components/StockLevelIndicator";
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
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash, 
  ArrowUpDown 
} from "lucide-react";
import { format } from "date-fns";
import { Material } from "@/types";

const Inventory = () => {
  const { materials, addMaterial, updateMaterial, deleteMaterial } = useData();
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState<Material | null>(null);
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    currentQuantity: 0,
    minQuantity: 0,
    unit: "",
    pricePerUnit: 0,
    category: ""
  });
  
  // Get unique categories
  const categories = Array.from(
    new Set(materials.map((material) => material.category || "Uncategorized"))
  );
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "name" || name === "unit" || name === "category" 
        ? value 
        : Number(value)
    });
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      currentQuantity: 0,
      minQuantity: 0,
      unit: "",
      pricePerUnit: 0,
      category: ""
    });
  };
  
  // Handle add material
  const handleAddMaterial = () => {
    if (!formData.name || !formData.unit) {
      toast({
        title: "Error",
        description: "Name and unit are required",
        variant: "destructive"
      });
      return;
    }
    
    addMaterial({
      name: formData.name,
      currentQuantity: formData.currentQuantity,
      minQuantity: formData.minQuantity,
      unit: formData.unit,
      pricePerUnit: formData.pricePerUnit,
      category: formData.category
    });
    
    resetForm();
    setIsAddDialogOpen(false);
  };
  
  // Handle edit material preparation
  const handleEditClick = (material: Material) => {
    setCurrentMaterial(material);
    setFormData({
      name: material.name,
      currentQuantity: material.currentQuantity,
      minQuantity: material.minQuantity,
      unit: material.unit,
      pricePerUnit: material.pricePerUnit,
      category: material.category || ""
    });
    setIsEditDialogOpen(true);
  };
  
  // Handle update material
  const handleUpdateMaterial = () => {
    if (!currentMaterial) return;
    
    updateMaterial({
      ...currentMaterial,
      name: formData.name,
      currentQuantity: formData.currentQuantity,
      minQuantity: formData.minQuantity,
      unit: formData.unit,
      pricePerUnit: formData.pricePerUnit,
      category: formData.category
    });
    
    resetForm();
    setIsEditDialogOpen(false);
  };
  
  // Handle delete material preparation
  const handleDeleteClick = (material: Material) => {
    setCurrentMaterial(material);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (!currentMaterial) return;
    
    deleteMaterial(currentMaterial.id);
    setIsDeleteDialogOpen(false);
  };
  
  // Handle sort
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };
  
  // Filtered and sorted materials
  const filteredMaterials = materials
    .filter(material => 
      filterCategory === "all" || 
      (material.category || "Uncategorized") === filterCategory
    )
    .sort((a, b) => {
      let valueA: any = a[sortBy as keyof Material];
      let valueB: any = b[sortBy as keyof Material];
      
      if (typeof valueA === "string") {
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
        <div className="flex items-center cursor-pointer" onClick={() => handleSort("name")}>
          Name
          {sortBy === "name" && (
            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
          )}
        </div>
      ),
      accessor: "name",
    },
    {
      header: (
        <div className="flex items-center cursor-pointer" onClick={() => handleSort("currentQuantity")}>
          Stock
          {sortBy === "currentQuantity" && (
            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
          )}
        </div>
      ),
      accessor: "currentQuantity",
      cell: (row: Material) => (
        <div className="flex items-center">
          <span className={row.currentQuantity <= row.minQuantity ? "low-stock-alert mr-2" : "mr-2"}>
            {row.currentQuantity}
          </span>
          <span className="text-muted-foreground">{row.unit}</span>
        </div>
      ),
    },
    {
      header: "Stock Level",
      accessor: "stockLevel",
      cell: (row: Material) => (
        <StockLevelIndicator
          current={row.currentQuantity}
          minimum={row.minQuantity}
        />
      ),
    },
    {
      header: (
        <div className="flex items-center cursor-pointer" onClick={() => handleSort("pricePerUnit")}>
          Unit Price
          {sortBy === "pricePerUnit" && (
            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
          )}
        </div>
      ),
      accessor: "pricePerUnit",
      cell: (row: Material) => formatCurrency(row.pricePerUnit),
    },
    {
      header: "Total Value",
      accessor: "totalValue",
      cell: (row: Material) => formatCurrency(row.currentQuantity * row.pricePerUnit),
    },
    {
      header: (
        <div className="flex items-center cursor-pointer" onClick={() => handleSort("category")}>
          Category
          {sortBy === "category" && (
            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
          )}
        </div>
      ),
      accessor: "category",
      cell: (row: Material) => row.category || "Uncategorized",
    },
    {
      header: "Last Updated",
      accessor: "lastUpdated",
      cell: (row: Material) => format(new Date(row.lastUpdated), "MMM d, yyyy"),
    },
    {
      header: "",
      accessor: "actions",
      cell: (row: Material) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background">
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
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        
        <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0 w-full md:w-auto">
          <Select 
            value={filterCategory} 
            onValueChange={setFilterCategory}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Material
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Material</DialogTitle>
                <DialogDescription>
                  Enter the details of the new material below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="currentQuantity">Current Quantity</Label>
                    <Input
                      id="currentQuantity"
                      name="currentQuantity"
                      type="number"
                      value={formData.currentQuantity}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="minQuantity">Minimum Quantity</Label>
                    <Input
                      id="minQuantity"
                      name="minQuantity"
                      type="number"
                      value={formData.minQuantity}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit">Unit of Measurement</Label>
                  <Input
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pricePerUnit">Price Per Unit</Label>
                  <Input
                    id="pricePerUnit"
                    name="pricePerUnit"
                    type="number"
                    step="0.01"
                    value={formData.pricePerUnit}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddMaterial}>Add Material</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DataTable columns={columns} data={filteredMaterials} />
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Material</DialogTitle>
            <DialogDescription>
              Update the details of the material below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-currentQuantity">Current Quantity</Label>
                <Input
                  id="edit-currentQuantity"
                  name="currentQuantity"
                  type="number"
                  value={formData.currentQuantity}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-minQuantity">Minimum Quantity</Label>
                <Input
                  id="edit-minQuantity"
                  name="minQuantity"
                  type="number"
                  value={formData.minQuantity}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-unit">Unit of Measurement</Label>
              <Input
                id="edit-unit"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-pricePerUnit">Price Per Unit</Label>
              <Input
                id="edit-pricePerUnit"
                name="pricePerUnit"
                type="number"
                step="0.01"
                value={formData.pricePerUnit}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Category</Label>
              <Input
                id="edit-category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateMaterial}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {currentMaterial?.name}? This action cannot be undone.
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

export default Inventory;
