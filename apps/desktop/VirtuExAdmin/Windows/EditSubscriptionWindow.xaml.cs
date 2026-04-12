using System;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using Wpf.Ui.Controls;

namespace VirtuExAdmin.Windows;

public partial class EditSubscriptionWindow : FluentWindow
{
    public string SelectedPlanName { get; private set; } = "Free";

    public EditSubscriptionWindow(string fullName, string username, string currentPlanName)
    {
        InitializeComponent();

        Owner = Application.Current?.MainWindow;

        UserLabel.Text = $"{fullName} (@{username})";

        var displayCurrent = string.IsNullOrWhiteSpace(currentPlanName) ? "Free" : currentPlanName;
        if (string.Equals(displayCurrent, "No plan", StringComparison.OrdinalIgnoreCase))
            displayCurrent = "Free";

        CurrentPlanLabel.Text = $"Current plan: {displayCurrent}";

        // Default selection
        var targetPlan = NormalisePlanName(displayCurrent);
        SetComboSelection(targetPlan);
    }

    private static string NormalisePlanName(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return "Free";

        var v = raw.Trim();
        if (v.Equals("No plan", StringComparison.OrdinalIgnoreCase)) return "Free";
        if (v.Equals("Starter", StringComparison.OrdinalIgnoreCase)) return "Free";
        if (v.Equals("Professional", StringComparison.OrdinalIgnoreCase)) return "Pro";

        return v;
    }

    private void SetComboSelection(string plan)
    {
        foreach (var item in PlanCombo.Items.OfType<ComboBoxItem>())
        {
            if (item.Content is string s && s.Equals(plan, StringComparison.OrdinalIgnoreCase))
            {
                PlanCombo.SelectedItem = item;
                return;
            }
        }

        PlanCombo.SelectedIndex = 0;
    }

    private void Save_Click(object sender, RoutedEventArgs e)
    {
        if (PlanCombo.SelectedItem is ComboBoxItem item && item.Content is string plan)
            SelectedPlanName = plan;
        else
            SelectedPlanName = "Free";

        DialogResult = true;
        Close();
    }

    private void Cancel_Click(object sender, RoutedEventArgs e)
    {
        DialogResult = false;
        Close();
    }
}
