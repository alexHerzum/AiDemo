package bamboo.specs;

import org.junit.Test;

import static org.junit.Assert.assertTrue;

public class AUIPlanSpecTest {
    @Test
    public void getResourcePath() throws Exception {
        assertTrue("resource found", AUIPlanSpec.getResourcePath("./fakeTestsResults.sh").toFile().exists());
    }

}
