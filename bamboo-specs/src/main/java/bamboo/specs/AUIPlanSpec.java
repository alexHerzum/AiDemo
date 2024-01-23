package bamboo.specs;

import com.atlassian.bamboo.specs.api.BambooSpec;
import com.atlassian.bamboo.specs.api.builders.AtlassianModule;
import com.atlassian.bamboo.specs.api.builders.BambooKey;
import com.atlassian.bamboo.specs.api.builders.notification.AnyNotificationRecipient;
import com.atlassian.bamboo.specs.api.builders.notification.Notification;
import com.atlassian.bamboo.specs.api.builders.permission.PermissionType;
import com.atlassian.bamboo.specs.api.builders.permission.Permissions;
import com.atlassian.bamboo.specs.api.builders.permission.PlanPermissions;
import com.atlassian.bamboo.specs.api.builders.plan.Job;
import com.atlassian.bamboo.specs.api.builders.plan.Plan;
import com.atlassian.bamboo.specs.api.builders.plan.Stage;
import com.atlassian.bamboo.specs.api.builders.plan.artifact.Artifact;
import com.atlassian.bamboo.specs.api.builders.plan.branches.BranchCleanup;
import com.atlassian.bamboo.specs.api.builders.plan.branches.PlanBranchManagement;
import com.atlassian.bamboo.specs.api.builders.project.Project;
import com.atlassian.bamboo.specs.builders.notification.PlanCompletedNotification;
import com.atlassian.bamboo.specs.builders.task.CheckoutItem;
import com.atlassian.bamboo.specs.builders.task.ScriptTask;
import com.atlassian.bamboo.specs.builders.task.TestParserTask;
import com.atlassian.bamboo.specs.builders.task.VcsCheckoutTask;
import com.atlassian.bamboo.specs.builders.trigger.RepositoryPollingTrigger;
import com.atlassian.bamboo.specs.builders.trigger.ScheduledTrigger;
import com.atlassian.bamboo.specs.model.task.ScriptTaskProperties;
import com.atlassian.bamboo.specs.model.task.TestParserTaskProperties;
import com.atlassian.bamboo.specs.util.BambooServer;
import com.atlassian.bamboo.specs.util.SimpleUserPasswordCredentials;
import org.jetbrains.annotations.NotNull;

import java.net.URISyntaxException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;

@BambooSpec
public class AUIPlanSpec {

    private static final BambooKey PROJECT_KEY = new BambooKey("TIS");
    private static final BambooKey PLAN_KEY = new BambooKey("AUISPECS");

    public static void main(String... argv) {
        final BambooServer bambooServer = new BambooServer("http://bamboo.teamsinspace.com:8085",
            new SimpleUserPasswordCredentials("admin", "Charlie!"));

        final Project tisProject = new Project().key(PROJECT_KEY).name("Teams In Space");
        final Plan plan = apolloPlan(tisProject);
        bambooServer.publish(plan);
//        bambooServer.publish(planPermissions(plan));
    }

    private static Plan apolloPlan(final Project tisProject) {
        return new Plan(tisProject,
            "Apollo UI (Specs)", PLAN_KEY)
            .description("Tests for Apollo UI framwework")
            .stages(buildStage(), testStage())
            .linkedRepositories("Apollo")
            .triggers(new ScheduledTrigger()
                    .cronExpression("0 15 16 ? * *"),
                new RepositoryPollingTrigger()
                    .withPollingPeriod(Duration.ofSeconds(30)))
            .planBranchManagement(new PlanBranchManagement()
                .createForVcsBranchMatching("(feature|bugfix)/.*")
                .delete(new BranchCleanup()
                    .whenRemovedFromRepositoryAfterDays(1))
                .notificationLikeParentPlan())
            .notifications(new Notification()
                .type(new PlanCompletedNotification())
                .recipients(new AnyNotificationRecipient(new AtlassianModule("com.atlassian.bamboo.plugins.bamboo-stash-plugin:recipient.stash"))));
    }

    private static Stage buildStage() {
        return new Stage("Build")
            .jobs(new Job("Package",
                new BambooKey("PAC"))
                .tasks(new VcsCheckoutTask()
                        .description("Checkout Default Repository")
                        .checkoutItems(new CheckoutItem().defaultRepository()),
                    new ScriptTask()
                        .interpreter(ScriptTaskProperties.Interpreter.BINSH_OR_CMDEXE)
                        .inlineBody("sleep 10")));
    }

    private static Stage testStage() {
        return new Stage("Test")
            .jobs(new Job("Functional Tests",
                    new BambooKey("FT"))
                    .artifacts(new Artifact()
                        .name("Apollo UI package")
                        .copyPattern("tests.xml")
                        .location("./")
                        .shared(true))
                    .tasks(new ScriptTask()
                            .description("Func Test all the things")
                            .interpreter(ScriptTaskProperties.Interpreter.BINSH_OR_CMDEXE)
                            .inlineBodyFromPath(getResourcePath("./fakeTestsResults.sh")),
                        testParserTask()),
                new Job("Integration Tests",
                    new BambooKey("IT"))
                    .tasks(new ScriptTask()
                            .description("IT test all the things")
                            .interpreter(ScriptTaskProperties.Interpreter.BINSH_OR_CMDEXE)
                            .inlineBodyFromPath(getResourcePath("./fakeTestsResults.sh")),
                        testParserTask()));
    }

    private static TestParserTask testParserTask() {
        return new TestParserTask(TestParserTaskProperties.TestType.JUNIT)
            .description("Test results")
            .resultDirectories("*.xml");
    }

    @NotNull
    private static PlanPermissions planPermissions(final Plan plan) {
        return new PlanPermissions(plan.getIdentifier())
            .permissions(new Permissions()
                .userPermissions("admin", PermissionType.EDIT, PermissionType.VIEW, PermissionType.ADMIN, PermissionType.CLONE, PermissionType.BUILD)
                .loggedInUserPermissions(PermissionType.VIEW, PermissionType.BUILD)
                .anonymousUserPermissionView());
    }

    static Path getResourcePath(final String resource) {
        try {
            return Paths.get(AUIPlanSpec.class.getResource(resource).toURI());
        } catch (URISyntaxException e) {
            throw new RuntimeException("Failed to load resource", e);
        }
    }
}
