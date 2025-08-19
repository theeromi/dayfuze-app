import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2, Palette, Plus, Check, Eye } from "lucide-react";
import { useTheme, Theme, ThemeColors } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";

interface ColorInputProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
}

function ColorInput({ label, color, onChange }: ColorInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <div
          className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
          style={{ backgroundColor: color }}
          onClick={() => document.getElementById(`color-${label}`)?.click()}
        />
        <Input
          id={`color-${label}`}
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="w-16 h-10 p-1 border cursor-pointer"
        />
        <Input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 text-sm font-mono"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

interface ThemePreviewProps {
  theme: Theme;
  isActive?: boolean;
}

function ThemePreview({ theme, isActive }: ThemePreviewProps) {
  const { setTheme, deleteCustomTheme, isCustomTheme } = useTheme();

  return (
    <Card 
      className={`cursor-pointer transition-all hover:scale-105 ${
        isActive ? 'ring-2 ring-blue-500 shadow-lg' : ''
      }`}
      onClick={() => setTheme(theme.id)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Theme name and actions */}
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">{theme.name}</h3>
            <div className="flex items-center space-x-1">
              {isActive && <Check className="w-4 h-4 text-green-500" />}
              {isCustomTheme(theme.id) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCustomTheme(theme.id);
                  }}
                  className="p-1 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Color palette preview */}
          <div className="grid grid-cols-4 gap-1 h-12">
            <div 
              className="rounded-sm flex items-center justify-center"
              style={{ backgroundColor: theme.colors.primary }}
              title="Primary"
            />
            <div 
              className="rounded-sm"
              style={{ backgroundColor: theme.colors.secondary }}
              title="Secondary"
            />
            <div 
              className="rounded-sm"
              style={{ backgroundColor: theme.colors.accent }}
              title="Accent"
            />
            <div 
              className="rounded-sm border"
              style={{ backgroundColor: theme.colors.background }}
              title="Background"
            />
          </div>

          {/* Theme type badge */}
          <div className="flex justify-between items-center">
            <Badge variant={isCustomTheme(theme.id) ? "default" : "secondary"} className="text-xs">
              {isCustomTheme(theme.id) ? "Custom" : "Built-in"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ThemeCustomizer() {
  const { currentTheme, themes, createCustomTheme } = useTheme();
  const { toast } = useToast();
  const [showCustomCreator, setShowCustomCreator] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customColors, setCustomColors] = useState<ThemeColors>({
    primary: "#3b82f6",
    secondary: "#1e40af",
    accent: "#60a5fa",
    background: "#f8fafc",
    surface: "#ffffff",
    text: "#1e293b",
    textSecondary: "#64748b"
  });
  const [previewMode, setPreviewMode] = useState(false);

  const handleCreateCustomTheme = () => {
    if (!customName.trim()) {
      toast({
        title: "Theme name required",
        description: "Please enter a name for your custom theme.",
        variant: "destructive",
      });
      return;
    }

    createCustomTheme(customName.trim(), customColors);
    toast({
      title: "Custom theme created",
      description: `"${customName.trim()}" has been created and applied.`,
    });

    // Reset form
    setCustomName("");
    setShowCustomCreator(false);
  };

  const previewCustomColors = () => {
    if (!previewMode) return;
    
    const root = document.documentElement;
    Object.entries(customColors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key === 'textSecondary' ? 'text-secondary' : key}`, value);
    });
  };

  const resetPreview = () => {
    if (previewMode) {
      const root = document.documentElement;
      Object.entries(currentTheme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key === 'textSecondary' ? 'text-secondary' : key}`, value);
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Palette className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Theme Customizer</h2>
        </div>
        <Button
          onClick={() => setShowCustomCreator(!showCustomCreator)}
          className="flex items-center space-x-2"
          data-testid="button-create-theme"
        >
          <Plus className="w-4 h-4" />
          <span>Create Custom</span>
        </Button>
      </div>

      {/* Current theme info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Current Theme</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{currentTheme.name}</p>
            </div>
            <div className="flex space-x-1">
              {Object.values(currentTheme.colors).slice(0, 4).map((color, index) => (
                <div
                  key={index}
                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom theme creator */}
      {showCustomCreator && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Create Custom Theme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme Name</label>
              <Input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="My Custom Theme"
                data-testid="input-theme-name"
              />
            </div>

            {/* Preview toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Live Preview</span>
              <Button
                variant={previewMode ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setPreviewMode(!previewMode);
                  if (!previewMode) {
                    previewCustomColors();
                  } else {
                    resetPreview();
                  }
                }}
                className="flex items-center space-x-1"
              >
                <Eye className="w-4 h-4" />
                <span>{previewMode ? "Exit Preview" : "Preview"}</span>
              </Button>
            </div>

            <Separator />

            {/* Color inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ColorInput
                label="Primary"
                color={customColors.primary}
                onChange={(color) => {
                  setCustomColors(prev => ({ ...prev, primary: color }));
                  if (previewMode) previewCustomColors();
                }}
              />
              <ColorInput
                label="Secondary"
                color={customColors.secondary}
                onChange={(color) => {
                  setCustomColors(prev => ({ ...prev, secondary: color }));
                  if (previewMode) previewCustomColors();
                }}
              />
              <ColorInput
                label="Accent"
                color={customColors.accent}
                onChange={(color) => {
                  setCustomColors(prev => ({ ...prev, accent: color }));
                  if (previewMode) previewCustomColors();
                }}
              />
              <ColorInput
                label="Background"
                color={customColors.background}
                onChange={(color) => {
                  setCustomColors(prev => ({ ...prev, background: color }));
                  if (previewMode) previewCustomColors();
                }}
              />
              <ColorInput
                label="Surface"
                color={customColors.surface}
                onChange={(color) => {
                  setCustomColors(prev => ({ ...prev, surface: color }));
                  if (previewMode) previewCustomColors();
                }}
              />
              <ColorInput
                label="Text"
                color={customColors.text}
                onChange={(color) => {
                  setCustomColors(prev => ({ ...prev, text: color }));
                  if (previewMode) previewCustomColors();
                }}
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <Button
                onClick={handleCreateCustomTheme}
                className="flex-1"
                data-testid="button-save-theme"
              >
                Create Theme
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCustomCreator(false);
                  if (previewMode) {
                    resetPreview();
                    setPreviewMode(false);
                  }
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Theme gallery */}
      <div>
        <h3 className="font-medium mb-4">Available Themes</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <ThemePreview
              key={theme.id}
              theme={theme}
              isActive={currentTheme.id === theme.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}